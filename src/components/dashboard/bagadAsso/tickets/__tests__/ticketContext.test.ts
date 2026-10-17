import { describe, expect, it } from "vitest"

import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

import { ticketReducer, type TicketDetails } from "../ticketContext"

const details: TicketDetails = {
    ticket: bagadAssoTicketRecord(),
    allEquipments: [
        {
            id: 1,
            name: "Barnum",
            requestedQuantity: 5,
            allocatedQuantity: 1,
            includedInContract: null,
            deposit: 50,
            imagePath: undefined
        },
        {
            id: 2,
            name: "Table",
            requestedQuantity: 4,
            allocatedQuantity: 2,
            includedInContract: false,
            deposit: 10,
            imagePath: undefined
        }
    ],
    totalDeposit: 70,
    canEditTicket: true,
    canDeleteTicket: false
}

describe("ticketReducer", () => {
    it("updates only allocated quantity and deposit without changing the request or selection", (): void => {
        const original: TicketDetails = {
            ...details,
            allEquipments: details.allEquipments.map(
                (equipment): typeof equipment => ({
                    ...equipment,
                    checked: equipment.id === 1
                })
            )
        }
        const next = ticketReducer(original, {
            type: "setEquipmentQuantity",
            id: 1,
            quantity: 3
        })
        expect(next.allEquipments[0]).toEqual({
            ...original.allEquipments[0],
            allocatedQuantity: 3
        })
        expect(next.allEquipments[0].requestedQuantity).toBe(5)
        expect(next.allEquipments[1]).toBe(original.allEquipments[1])
        expect(next.totalDeposit).toBe(170)
        expect(next.ticket).toBe(original.ticket)
        expect(original.allEquipments[0].allocatedQuantity).toBe(1)
        expect(original.totalDeposit).toBe(70)
        expect(
            ticketReducer(next, {
                type: "setEquipmentQuantity",
                id: 1,
                quantity: 2
            }).totalDeposit
        ).toBe(120)
    })

    it.each([
        0,
        -1,
        1.5,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.MAX_SAFE_INTEGER + 1
    ])("ignores invalid quantity %s", (quantity): void => {
        expect(
            ticketReducer(details, {
                type: "setEquipmentQuantity",
                id: 1,
                quantity
            })
        ).toBe(details)
    })

    it("ignores absent equipment", (): void => {
        expect(
            ticketReducer(details, {
                type: "setEquipmentQuantity",
                id: 99,
                quantity: 3
            })
        ).toBe(details)
    })

    it("marks the contract as sent and persists the current selection locally", (): void => {
        const validated = new Date("2026-10-17T12:00:00Z")
        const selected = ticketReducer(details, {
            type: "setEquipmentChecked",
            id: 1,
            checked: true
        })
        const next = ticketReducer(selected, {
            type: "setValidated",
            validated
        })
        expect(next.ticket.validated).toEqual(validated)
        expect(details.ticket.validated).toBeNull()
        expect(next.allEquipments).toEqual([
            {
                ...selected.allEquipments[0],
                includedInContract: true,
                checked: true
            },
            {
                ...selected.allEquipments[1],
                includedInContract: false,
                checked: false
            }
        ])
        expect(details.allEquipments[0].includedInContract).toBeNull()
        expect(selected.allEquipments[0].includedInContract).toBeNull()
    })

    it("replaces saved contract flags with Boolean values of the current selection", (): void => {
        const original: TicketDetails = {
            ...details,
            allEquipments: details.allEquipments.map(
                (equipment): typeof equipment => ({
                    ...equipment,
                    includedInContract: true,
                    checked: false
                })
            )
        }
        const next = ticketReducer(original, {
            type: "setValidated",
            validated: new Date()
        })
        expect(
            next.allEquipments.map((equipment) => equipment.includedInContract)
        ).toEqual([false, false])
        expect(original.allEquipments[0].includedInContract).toBe(true)
    })

    it("checks only the selected equipment without mutating the previous state", (): void => {
        const next = ticketReducer(details, {
            type: "setEquipmentChecked",
            id: 1,
            checked: true
        })

        expect(next.allEquipments[0].checked).toBe(true)
        expect(next.allEquipments[0].includedInContract).toBeNull()
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

    it("archives and unarchives the ticket without changing the equipment", (): void => {
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
