import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAddConseil } from "@/test/factories/conseils"
import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findInstance: vi.fn(),
    createConseil: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        instance: { findUnique: h.findInstance },
        conseil: { create: h.createConseil }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addConseilAction from "../addConseilAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:instance"]))
    h.findInstance.mockResolvedValue({ id: 1 })
    h.createConseil.mockResolvedValue({ id: 1 })
})

describe("addConseilAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addConseilAction(validAddConseil())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.createConseil).not.toHaveBeenCalled()
    })

    it("is gated on the create:instance permission (reused for conseils)", async () => {
        h.getUser.mockResolvedValue(mockUser(["create:elu"]))
        const res = await addConseilAction(validAddConseil())
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.createConseil).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addConseilAction(validAddConseil({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.createConseil).not.toHaveBeenCalled()
    })

    it("returns an error when the instance is not found", async () => {
        h.findInstance.mockResolvedValue(null)
        const res = await addConseilAction(validAddConseil())
        expect(res).toEqual({ success: false, error: "Instance introuvable." })
        expect(h.createConseil).not.toHaveBeenCalled()
    })

    it("captures and fails when the insert throws", async () => {
        h.createConseil.mockRejectedValue(new Error("db down"))
        const res = await addConseilAction(validAddConseil())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the conseil and revalidates on the happy path", async () => {
        const res = await addConseilAction(
            validAddConseil({ description: "Conseil restreint" })
        )
        expect(res).toEqual({ success: true })
        expect(h.createConseil).toHaveBeenCalledWith({
            data: {
                name: "Bureau",
                description: "Conseil restreint",
                instanceId: 1
            }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/representation/nos-elues"
        )
    })
})
