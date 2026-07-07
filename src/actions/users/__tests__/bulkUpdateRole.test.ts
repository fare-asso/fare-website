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

import bulkUpdateRole from "../bulkUpdateRole"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:user"], "ADMIN"))
    h.updateMany.mockResolvedValue({ count: 1 })
})

describe("bulkUpdateRole", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await bulkUpdateRole(["u2"], "MEMBER")).toEqual({
            success: false,
            error: "Non authentifié"
        })
    })

    it("requires the ADMIN role", async () => {
        h.getUser.mockResolvedValue(mockUser(["edit:user"], "MEMBER"))
        expect(await bulkUpdateRole(["u2"], "MEMBER")).toEqual({
            success: false,
            error: "Accès réservé aux administrateurs"
        })
    })

    it("requires the edit:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        expect(await bulkUpdateRole(["u2"], "MEMBER")).toEqual({
            success: false,
            error: "Permission insuffisante"
        })
    })

    it("rejects when only the current user would change", async () => {
        const res = await bulkUpdateRole(["user-1"], "MEMBER")
        expect(res.success).toBe(false)
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("captures and fails when updateMany throws", async () => {
        h.updateMany.mockRejectedValue(new Error("db down"))
        expect(await bulkUpdateRole(["u2"], "MEMBER")).toEqual({
            success: false,
            error: "Une erreur s'est produite lors de la modification des rôles"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the role for filtered users and revalidates", async () => {
        const res = await bulkUpdateRole(["u2", "user-1"], "ASSO_OWNER")
        expect(res).toEqual({
            success: true,
            updatedCount: 1,
            skippedSelf: true
        })
        expect(h.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["u2"] } },
            data: { role: "ASSO_OWNER" }
        })
    })
})
