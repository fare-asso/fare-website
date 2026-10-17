import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    findTicketLine: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoEquipment: { findUnique: h.findUnique, delete: h.deleteFn },
        bagadAssoTicketEquipment: { findFirst: h.findTicketLine }
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
    h.findTicketLine.mockResolvedValue(null)
    h.deleteFn.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ data: [], error: null })
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

    it("captures a failed equipment lookup without deleting storage", async () => {
        const error = new Error("lookup failed")
        h.findUnique.mockRejectedValue(error)
        expect((await deleteEquipmentAction(1)).success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledWith(error)
        expect(h.findTicketLine).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("denies deletion of referenced equipment before touching storage", async () => {
        h.findTicketLine.mockResolvedValue({ ticketId: 99 })
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Ce matériel est lié à des tickets et ne peut pas être supprimé."
        })
        expect(h.findTicketLine).toHaveBeenCalledWith({
            where: { equipmentId: 1 },
            select: { ticketId: true }
        })
        expect(from).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("captures a failed reference lookup without deleting storage", async () => {
        const error = new Error("reference lookup failed")
        h.findTicketLine.mockRejectedValue(error)
        expect(await deleteEquipmentAction(1)).toEqual({
            success: false,
            error: "Echec de la vérification des réservations de l'équipement"
        })
        expect(h.captureActionError).toHaveBeenCalledWith(error)
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures a thrown storage error and stops deletion", async () => {
        const error = new Error("storage failed")
        h.remove.mockRejectedValue(error)
        expect((await deleteEquipmentAction(1)).success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledWith(error)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("does not access storage for equipment without a picture", async () => {
        h.findUnique.mockResolvedValue({ id: 1, imagePath: null })
        expect(await deleteEquipmentAction(1)).toEqual({ success: true })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("errors when the image removal fails", async () => {
        h.remove.mockResolvedValue({ data: null, error: { message: "boom" } })
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
        expect(h.findUnique).toHaveBeenCalledWith({ where: { id: 4 } })
        expect(h.remove).toHaveBeenCalledWith(["equip.png"])
        expect(h.findTicketLine.mock.invocationCallOrder[0]).toBeLessThan(
            h.remove.mock.invocationCallOrder[0]!
        )
    })
})
