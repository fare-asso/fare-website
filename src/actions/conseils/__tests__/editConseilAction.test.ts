import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEditConseil } from "@/test/factories/conseils"
import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findInstance: vi.fn(),
    updateConseil: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        instance: { findUnique: h.findInstance },
        conseil: { update: h.updateConseil }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editConseilAction from "../editConseilAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:instance"]))
    h.findInstance.mockResolvedValue({ id: 1 })
    h.updateConseil.mockResolvedValue({ id: 1 })
})

describe("editConseilAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editConseilAction(validEditConseil())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateConseil).not.toHaveBeenCalled()
    })

    it("is gated on the edit:instance permission (reused for conseils)", async () => {
        h.getUser.mockResolvedValue(mockUser(["edit:elu"]))
        const res = await editConseilAction(validEditConseil())
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateConseil).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editConseilAction(validEditConseil({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.updateConseil).not.toHaveBeenCalled()
    })

    it("returns an error when the instance is not found", async () => {
        h.findInstance.mockResolvedValue(null)
        const res = await editConseilAction(validEditConseil())
        expect(res).toEqual({ success: false, error: "Instance introuvable." })
        expect(h.updateConseil).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.updateConseil.mockRejectedValue(new Error("db down"))
        const res = await editConseilAction(validEditConseil())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the conseil and revalidates on the happy path", async () => {
        const res = await editConseilAction(validEditConseil())
        expect(res).toEqual({ success: true })
        expect(h.updateConseil).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { name: "Bureau", description: null, instanceId: 1 }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/representation/nos-elues"
        )
    })
})
