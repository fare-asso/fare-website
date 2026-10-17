import { beforeEach, describe, expect, it, vi } from "vitest"

import { ticketEquipmentInclude } from "@/helpers/bagadAsso/ticketEquipment"
import type { ActionResult } from "@/lib/action"
import { bagadAssoTicketWithEquipmentsRecord } from "@/test/factories/bagadAsso"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findTicket: vi.fn(),
    claim: vi.fn(),
    updateLine: vi.fn(),
    transaction: vi.fn(),
    capture: vi.fn()
}))
vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoTicket: { findUnique: h.findTicket },
        $transaction: h.transaction
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.capture))

import { updateTicketEquipmentQuantityAction } from "../updateTicketEquipmentQuantityAction"

const input = { ticketId: 1, equipmentId: 1, quantity: 1 }
const tx = {
    bagadAssoTicket: { updateMany: h.claim },
    bagadAssoTicketEquipment: { update: h.updateLine }
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.findTicket.mockResolvedValue(bagadAssoTicketWithEquipmentsRecord())
    h.claim.mockResolvedValue({ count: 1 })
    h.updateLine.mockResolvedValue({ allocatedQuantity: 1 })
    h.transaction.mockImplementation(
        (
            run: (
                client: typeof tx
            ) => Promise<ActionResult<{ quantity: number }>>
        ) => run(tx)
    )
})

describe("updateTicketEquipmentQuantityAction", () => {
    it("requires authentication and permission", async () => {
        h.getUser.mockResolvedValueOnce(null)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        h.getUser.mockResolvedValueOnce(mockUser([]))
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.findTicket).not.toHaveBeenCalled()
    })

    it("captures auth exceptions", async () => {
        h.getUser.mockRejectedValueOnce(new Error("auth down"))
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Échec de l'authentification"
        })
        expect(h.capture).toHaveBeenCalledOnce()
    })

    it.each([0, -1, 0.5, Number.NaN, Infinity, 2147483648])(
        "rejects invalid integers: %s",
        async (value) => {
            const results = await Promise.all(
                (["ticketId", "equipmentId", "quantity"] as const).map((key) =>
                    updateTicketEquipmentQuantityAction({
                        ...input,
                        [key]: value
                    })
                )
            )
            for (const result of results) {
                expect(result).toEqual({
                    success: false,
                    error: "Un ou plusieurs champs sont invalides."
                })
            }
            expect(h.findTicket).not.toHaveBeenCalled()
        }
    )

    it("reports lookup errors and missing tickets", async () => {
        h.findTicket.mockRejectedValueOnce(new Error("db down"))
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Echec de la récupération du ticket"
        })
        expect(h.capture).toHaveBeenCalledOnce()
        h.findTicket.mockResolvedValueOnce(null)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Ticket introuvable"
        })
    })

    it.each(["deleted", "validated"] as const)(
        "rejects %s tickets",
        async (field) => {
            h.findTicket.mockResolvedValueOnce(
                bagadAssoTicketWithEquipmentsRecord({ [field]: new Date() })
            )
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Ce ticket ne peut plus être modifié"
            })
            expect(h.transaction).not.toHaveBeenCalled()
        }
    )

    it("rejects allocations of soft-deleted equipment without modifying the ticket", async () => {
        const ticket = bagadAssoTicketWithEquipmentsRecord()
        ticket.equipments[0].equipment.deletedAt = new Date()
        h.findTicket.mockResolvedValueOnce(ticket)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Ce matériel a été supprimé"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("rejects equipment absent from the ticket and allocations above stock", async () => {
        expect(
            await updateTicketEquipmentQuantityAction({
                ...input,
                equipmentId: 99
            })
        ).toEqual({ success: false, error: "Matériel absent du ticket" })
        expect(
            await updateTicketEquipmentQuantityAction({ ...input, quantity: 3 })
        ).toEqual({
            success: false,
            error: "La quantité demandée dépasse le stock disponible"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("changes only allocatedQuantity and guards the parent revision", async () => {
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: true,
            value: { quantity: 1 }
        })
        expect(h.findTicket).toHaveBeenCalledWith({
            where: { id: 1 },
            include: ticketEquipmentInclude
        })
        expect(h.claim).toHaveBeenCalledWith({
            where: {
                id: 1,
                deleted: null,
                validated: null,
                equipmentRevision: 0
            },
            data: { equipmentRevision: { increment: 1 } }
        })
        expect(h.updateLine).toHaveBeenCalledWith({
            where: { ticketId_equipmentId: { ticketId: 1, equipmentId: 1 } },
            data: { allocatedQuantity: 1 }
        })
    })

    it("rejects concurrent changes before updating the allocation", async () => {
        h.claim.mockResolvedValueOnce({ count: 0 })
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Ce ticket a été modifié entre-temps. Veuillez le recharger."
        })
        expect(h.updateLine).not.toHaveBeenCalled()
        expect(h.capture).not.toHaveBeenCalled()
    })

    it.each(["transaction", "claim", "updateLine"] as const)(
        "captures %s failures",
        async (operation) => {
            h[operation].mockRejectedValueOnce(new Error("db down"))
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Echec de la mise à jour du ticket"
            })
            expect(h.capture).toHaveBeenCalledOnce()
        }
    )
})
