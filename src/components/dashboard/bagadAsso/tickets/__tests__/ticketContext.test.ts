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
    it.each(["string", "array"])(
        "updates quantities, deposits and stored %s equipment without losing selection",
        (format): void => {
            const equipments = [
                { id: 1, quantity: 1, note: "Keep me" },
                { id: 2, quantity: 2 },
                { id: 99, quantity: 4 }
            ]
            const original: TicketDetails = {
                ...details,
                ticket: {
                    ...details.ticket,
                    equipments:
                        format === "string"
                            ? JSON.stringify(equipments)
                            : equipments
                },
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
                quantity: 3
            })
            expect(next.allEquipments[1]).toBe(original.allEquipments[1])
            expect(next.totalDeposit).toBe(170)
            const updated = [
                { ...equipments[0], quantity: 3 },
                equipments[1],
                equipments[2]
            ]
            expect(next.ticket.equipments).toEqual(
                format === "string" ? JSON.stringify(updated) : updated
            )
            expect(original.allEquipments[0].quantity).toBe(1)
            expect(original.totalDeposit).toBe(70)
            expect(equipments[0].quantity).toBe(1)
            expect(
                ticketReducer(next, {
                    type: "setEquipmentQuantity",
                    id: 1,
                    quantity: 2
                }).totalDeposit
            ).toBe(120)
        }
    )

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

    it("ignores absent equipment and tolerates malformed stored JSON", (): void => {
        expect(
            ticketReducer(details, {
                type: "setEquipmentQuantity",
                id: 99,
                quantity: 3
            })
        ).toBe(details)
        const original = {
            ...details,
            ticket: { ...details.ticket, equipments: "invalid JSON" }
        }
        const next = ticketReducer(original, {
            type: "setEquipmentQuantity",
            id: 1,
            quantity: 3
        })
        expect(next.totalDeposit).toBe(170)
        expect(next.ticket.equipments).toBe("invalid JSON")
    })
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
