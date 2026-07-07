import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    updateMany: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ user: { updateMany: h.updateMany } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import bulkDeleteUsers from "../bulkDeleteUsers"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:user"], "ADMIN"))
    h.updateMany.mockResolvedValue({ count: 1 })
})

describe("bulkDeleteUsers", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await bulkDeleteUsers(["u2"])).toEqual({
            success: false,
            error: "Non authentifié"
        })
    })

    it("requires the ADMIN role", async () => {
        h.getUser.mockResolvedValue(mockUser(["delete:user"], "MEMBER"))
        expect(await bulkDeleteUsers(["u2"])).toEqual({
            success: false,
            error: "Accès réservé aux administrateurs"
        })
    })

    it("requires the delete:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        expect(await bulkDeleteUsers(["u2"])).toEqual({
            success: false,
            error: "Permission insuffisante"
        })
    })

    it("rejects when only the current user would be deleted", async () => {
        const res = await bulkDeleteUsers(["user-1"])
        expect(res.success).toBe(false)
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("captures and fails when updateMany throws", async () => {
        h.updateMany.mockRejectedValue(new Error("db down"))
        expect(await bulkDeleteUsers(["u2"])).toEqual({
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("soft-deletes the filtered users and revalidates", async () => {
        const res = await bulkDeleteUsers(["u2", "user-1"])
        expect(res).toEqual({
            success: true,
            deletedCount: 1,
            skippedSelf: true
        })
        expect(h.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["u2"] } },
            data: { deletedAt: expect.any(Date) }
        })
    })
})
