import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findConseil: vi.fn(),
    countElu: vi.fn(),
    deleteConseil: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        conseil: { findUnique: h.findConseil, delete: h.deleteConseil },
        elu: { count: h.countElu }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { deleteConseilAction } from "../deleteConseilAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:instance"]))
    h.findConseil.mockResolvedValue({ id: 1 })
    h.countElu.mockResolvedValue(0)
    h.deleteConseil.mockResolvedValue({ id: 1 })
})

describe("deleteConseilAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteConseilAction({ data: 1 })).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteConseil).not.toHaveBeenCalled()
    })

    it("is gated on the delete:instance permission (reused for conseils)", async () => {
        h.getUser.mockResolvedValue(mockUser(["delete:elu"]))
        const res = await deleteConseilAction({ data: 1 })
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.deleteConseil).not.toHaveBeenCalled()
    })

    it("returns an error when the conseil is not found", async () => {
        h.findConseil.mockResolvedValue(null)
        const res = await deleteConseilAction({ data: 1 })
        expect(res).toEqual({ success: false, error: "Conseil introuvable." })
        expect(h.deleteConseil).not.toHaveBeenCalled()
    })

    it("refuses to delete a conseil that still has elus", async () => {
        h.countElu.mockResolvedValue(3)
        const res = await deleteConseilAction({ data: 1 })
        expect(res).toEqual({
            success: false,
            error: "Supprimez d'abord les éluEs de ce conseil avant de le supprimer."
        })
        expect(h.deleteConseil).not.toHaveBeenCalled()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteConseil.mockRejectedValue(new Error("db down"))
        const res = await deleteConseilAction({ data: 1 })
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the conseil and revalidates on the happy path", async () => {
        const res = await deleteConseilAction({ data: 9 })
        expect(res).toEqual({ success: true })
        expect(h.countElu).toHaveBeenCalledWith({
            where: { conseilId: 9, deletedAt: null }
        })
        expect(h.deleteConseil).toHaveBeenCalledWith({ where: { id: 9 } })
    })
})
