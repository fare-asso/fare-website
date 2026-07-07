import { beforeEach, describe, expect, it, vi } from "vitest"

import { assistanceConfigRecord } from "@/test/factories/assistance"
import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        assistanceConfig: {
            findFirst: h.findFirst,
            update: h.update,
            create: h.create
        }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { updateAssistanceConfig } from "../updateAssistanceConfig"

const valid = { recipientEmail: "new@fare-asso.fr", delay: "24h" }

beforeEach(() => {
    h.findFirst.mockReset()
    h.update.mockReset()
    h.create.mockReset()
    h.getUser.mockResolvedValue(mockUser(["access:defense-droits"]))
})

describe("updateAssistanceConfig — authorisation", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await updateAssistanceConfig(valid)
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("requires the access:defense-droits permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await updateAssistanceConfig(valid)
        expect(res.success).toBe(false)
        expect(h.update).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})

describe("updateAssistanceConfig — validation", () => {
    it("rejects an invalid recipient email", async () => {
        const res = await updateAssistanceConfig({
            recipientEmail: "not-an-email",
            delay: "24h"
        })
        expect(res.success).toBe(false)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an empty delay", async () => {
        const res = await updateAssistanceConfig({
            recipientEmail: "ok@fare-asso.fr",
            delay: ""
        })
        expect(res.success).toBe(false)
    })
})

describe("updateAssistanceConfig — persistence", () => {
    it("updates the existing row", async () => {
        h.findFirst.mockResolvedValue(assistanceConfigRecord({ id: 7 }))
        const res = await updateAssistanceConfig(valid)

        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { recipientEmail: "new@fare-asso.fr", delay: "24h" }
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("creates the row when none exists", async () => {
        h.findFirst.mockResolvedValue(null)
        const res = await updateAssistanceConfig(valid)

        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: { recipientEmail: "new@fare-asso.fr", delay: "24h" }
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the write throws", async () => {
        h.findFirst.mockResolvedValue(assistanceConfigRecord({ id: 7 }))
        h.update.mockRejectedValue(new Error("db down"))
        const res = await updateAssistanceConfig(valid)

        expect(res).toEqual({
            success: false,
            error: "Échec de l'enregistrement de la configuration."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
