import { beforeEach, describe, expect, it, vi } from "vitest"

import { validTutorApplicationRecord } from "@/test/factories/bougeTaPrison"
import {
    cacheModule,
    dbModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    sendEmail: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorApplication: { update: h.update } })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import sendApprovalEmail from "../sendApprovalEmail"

beforeEach(() => {
    h.sendEmail.mockResolvedValue({ success: true })
    h.update.mockResolvedValue({ id: 1 })
})

describe("sendApprovalEmail", () => {
    it("returns an error when the transporter reports a failure", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await sendApprovalEmail(validTutorApplicationRecord())
        expect(res.success).toBe(false)
        expect(res.error).toMatch(/email/i)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when sending throws", async () => {
        h.sendEmail.mockRejectedValue(new Error("smtp down"))
        const res = await sendApprovalEmail(validTutorApplicationRecord())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the approval update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await sendApprovalEmail(validTutorApplicationRecord())
        expect(res).toEqual({
            success: false,
            error: "Echec de la mise à jour de la candidature"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("emails, approves and revalidates on the happy path", async () => {
        const res = await sendApprovalEmail(
            validTutorApplicationRecord({ id: 5 })
        )
        expect(res).toEqual({ success: true, error: null })
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
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison"
        )
    })
})
