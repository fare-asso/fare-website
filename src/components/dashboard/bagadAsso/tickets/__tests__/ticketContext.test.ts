import { describe, expect, it } from "vitest"

import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

import { ticketReducer, type TicketDetails } from "../ticketContext"

const details: TicketDetails = {
    ticket: bagadAssoTicketRecord(),
    allEquipments: [
        {
            id: 1,
            name: "Barnum",
            quantity: 1,
            deposit: 50,
            imagePath: undefined
        },
        { id: 2, name: "Table", quantity: 2, deposit: 10, imagePath: undefined }
    ],
    totalDeposit: 70,
    canEditTicket: true,
    canDeleteTicket: false
}

describe("ticketReducer", () => {
    it("marks the contract as sent without mutating the original ticket", () => {
        const validated = new Date("2026-10-17T12:00:00Z")
        const next = ticketReducer(details, { type: "setValidated", validated })
        expect(next.ticket.validated).toEqual(validated)
        expect(details.ticket.validated).toBeNull()
        expect(next.allEquipments).toBe(details.allEquipments)
    })
    it("checks only the selected equipment without mutating the previous state", () => {
        const next = ticketReducer(details, {
            type: "setEquipmentChecked",
            id: 1,
            checked: true
        })

        expect(next.allEquipments[0].checked).toBe(true)
        expect(next.allEquipments[1]).toBe(details.allEquipments[1])
        expect(details.allEquipments[0].checked).toBeUndefined()
        expect(
            ticketReducer(next, {
                type: "setEquipmentChecked",
                id: 1,
                checked: false
            }).allEquipments[0].checked
        ).toBe(false)
    })

    it("archives and unarchives the ticket without changing the equipment", () => {
        const deleted = new Date("2026-01-02T00:00:00Z")
        const archived = ticketReducer(details, {
            type: "setArchived",
            deleted
        })

        expect(archived.ticket.deleted).toEqual(deleted)
        expect(archived.allEquipments).toBe(details.allEquipments)
        expect(details.ticket.deleted).toBeNull()
        expect(
            ticketReducer(archived, { type: "setArchived", deleted: null })
                .ticket.deleted
        ).toBeNull()
    })
})
