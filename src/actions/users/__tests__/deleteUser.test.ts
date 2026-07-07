import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ user: { update: h.update } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteUser from "../deleteUser"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:user"], "ADMIN"))
    h.update.mockResolvedValue({ id: "u2" })
})

describe("deleteUser", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteUser("u2")).toEqual({
            success: false,
            error: "Non authentifié"
        })
    })

    it("requires the ADMIN role", async () => {
        h.getUser.mockResolvedValue(mockUser(["delete:user"], "MEMBER"))
        expect(await deleteUser("u2")).toEqual({
            success: false,
            error: "Accès réservé aux administrateurs"
        })
    })

    it("requires the delete:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        expect(await deleteUser("u2")).toEqual({
            success: false,
            error: "Permission insuffisante"
        })
    })

    it("prevents self-deletion", async () => {
        const res = await deleteUser("user-1")
        expect(res.success).toBe(false)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await deleteUser("u2")).toEqual({
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("soft-deletes the user and revalidates", async () => {
        const res = await deleteUser("u2")
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "u2" },
            data: { deletedAt: expect.any(Date) }
        })
    })
})
