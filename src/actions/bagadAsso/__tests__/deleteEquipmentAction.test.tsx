import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    updateMany: vi.fn(),
    hardDelete: vi.fn(),
    remove: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))
vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoEquipment: { updateMany: h.updateMany, delete: h.hardDelete }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        getUserWithPermissions: h.getUser,
        storage: {
            from: (): { remove: typeof h.remove } => ({ remove: h.remove })
        }
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { deleteEquipmentAction } from "../deleteEquipmentAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:bagad-equipment"]))
    h.updateMany.mockResolvedValue({ count: 1 })
})

describe("deleteEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValueOnce(null)
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("requires permission", async () => {
        h.getUser.mockResolvedValueOnce(mockUser([]))
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it.each([0, -1, 1.5, Number.NaN, 2147483648])(
        "rejects invalid id %s",
        async (id) => {
            expect(await deleteEquipmentAction(id)).toEqual({
                success: false,
                error: "Identifiant de matériel invalide"
            })
            expect(h.updateMany).not.toHaveBeenCalled()
        }
    )

    it("soft-deletes without removing the row, image or ticket references", async () => {
        expect(await deleteEquipmentAction(4)).toEqual({ success: true })
        expect(h.updateMany).toHaveBeenCalledWith({
            where: { id: 4, deletedAt: null },
            data: { deletedAt: expect.any(Date) }
        })
        expect(h.hardDelete).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
    })

    it("returns an expected error for missing or already deleted equipment", async () => {
        h.updateMany.mockResolvedValueOnce({ count: 0 })
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Équipement introuvable ou déjà supprimé."
        })
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("captures database failures", async () => {
        const error = new Error("db down")
        h.updateMany.mockRejectedValueOnce(error)
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Echec de la suppression de l'équipement"
        })
        expect(h.captureActionError).toHaveBeenCalledWith(error)
    })
})
