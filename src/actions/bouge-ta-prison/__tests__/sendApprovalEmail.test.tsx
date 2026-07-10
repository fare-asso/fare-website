import { beforeEach, describe, expect, it, vi } from "vitest"

import { validTutorApplicationRecord } from "@/test/factories/bougeTaPrison"
import { mockUser } from "@/test/factories/user"
import {
    dbModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    supabaseAstroModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    sendEmail: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        bTPTutorApplication: { findUnique: h.findUnique, update: h.update }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { sendApprovalEmail } from "../sendApprovalEmail"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.findUnique.mockResolvedValue(validTutorApplicationRecord({ id: 5 }))
    h.sendEmail.mockResolvedValue({ success: true })
    h.update.mockResolvedValue({ id: 5 })
})

describe("sendApprovalEmail", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await sendApprovalEmail(5)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await sendApprovalEmail(5)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("fails when the application is not found", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await sendApprovalEmail(5)
        expect(res).toEqual({
            success: false,
            error: "Candidature introuvable"
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("returns an error when the transporter reports a failure", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await sendApprovalEmail(5)
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/email/i)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the approval update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await sendApprovalEmail(5)
        expect(res).toEqual({
            success: false,
            error: "Echec de la mise à jour de la candidature"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("emails the fetched applicant and approves on the happy path", async () => {
        const res = await sendApprovalEmail(5)
        expect(res).toEqual({ success: true })
        expect(h.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "lea@example.com",
                subject: "Bouge Ta Prison - Informations sur votre candidature"
            })
        )
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 5 },
            data: { approved: true }
        })
    })
})
