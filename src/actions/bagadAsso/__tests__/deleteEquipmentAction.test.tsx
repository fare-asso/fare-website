import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoEquipment: { findUnique: h.findUnique, delete: h.deleteFn }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { deleteEquipmentAction } from "../deleteEquipmentAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:bagad-equipment"]))
    h.findUnique.mockResolvedValue({ id: 1, imagePath: "equip.png" })
    h.deleteFn.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("deleteEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:bagad-equipment permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteEquipmentAction(1)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the equipment does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Echec de la suppression de l'équipement"
        })
    })

    it("errors when the image removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "boom" } })
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Echec de la suppression des images dans la base de données"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Echec de la suppression de l'équipement"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the equipment on the happy path", async () => {
        const res = await deleteEquipmentAction(4)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
    })
})
