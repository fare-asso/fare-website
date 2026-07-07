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

import bulkRestoreUsers from "../bulkRestoreUsers"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:user"], "ADMIN"))
    h.updateMany.mockResolvedValue({ count: 2 })
})

describe("bulkRestoreUsers", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await bulkRestoreUsers(["u2"])).toEqual({
            success: false,
            error: "Non authentifié"
        })
    })

    it("requires the ADMIN role", async () => {
        h.getUser.mockResolvedValue(mockUser(["delete:user"], "MEMBER"))
        expect(await bulkRestoreUsers(["u2"])).toEqual({
            success: false,
            error: "Accès réservé aux administrateurs"
        })
    })

    it("requires the delete:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        expect(await bulkRestoreUsers(["u2"])).toEqual({
            success: false,
            error: "Permission insuffisante"
        })
    })

    it("rejects an empty selection", async () => {
        expect(await bulkRestoreUsers([])).toEqual({
            success: false,
            error: "Aucun utilisateur sélectionné"
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("captures and fails when updateMany throws", async () => {
        h.updateMany.mockRejectedValue(new Error("db down"))
        expect(await bulkRestoreUsers(["u2"])).toEqual({
            success: false,
            error: "Une erreur s'est produite lors de la restauration"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("restores the users and revalidates", async () => {
        const res = await bulkRestoreUsers(["u2", "u3"])
        expect(res).toEqual({ success: true, restoredCount: 2 })
        expect(h.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["u2", "u3"] } },
            data: { deletedAt: null }
        })
    })
})
