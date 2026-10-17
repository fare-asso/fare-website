import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    mapTicketEquipment,
    ticketEquipmentInclude
} from "@/helpers/bagadAsso/ticketEquipment"
import {
    bagadAssoEquipmentRecord,
    bagadAssoTicketEquipmentRecord,
    bagadAssoTicketWithEquipmentsRecord
} from "@/test/factories/bagadAsso"
import { dbModule } from "@/test/mocks"

const h = vi.hoisted(() => ({ findMany: vi.fn() }))

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoTicket: { findMany: h.findMany } })
)

import { computeTotalDeposit, getNextBookingsByEquipment } from "../bagadAsso"

beforeEach(() => {
    h.findMany.mockReset()
})

describe("ticket equipment projection", () => {
    it("includes catalogue details in a stable catalogue-id order", () => {
        expect(ticketEquipmentInclude).toEqual({
            equipments: {
                orderBy: { equipmentId: "asc" },
                include: { equipment: true }
            }
        })
    })

    it.each([true, false, null])(
        "preserves inclusion %s and maps catalogue ids",
        (includedInContract) => {
            const ticket = bagadAssoTicketWithEquipmentsRecord({
                equipments: [
                    {
                        ...bagadAssoTicketEquipmentRecord({
                            ticketId: 99,
                            equipmentId: 7,
                            requestedQuantity: 5,
                            allocatedQuantity: 3,
                            includedInContract
                        }),
                        equipment: bagadAssoEquipmentRecord({
                            id: 7,
                            imagePath: null
                        })
                    }
                ]
            })
            expect(mapTicketEquipment(ticket)).toEqual([
                {
                    id: 7,
                    requestedQuantity: 5,
                    allocatedQuantity: 3,
                    includedInContract,
                    deposit: 50,
                    name: "Barnum",
                    imagePath: undefined,
                    deletedAt: null,
                    checked: includedInContract === true
                }
            ])
        }
    )

    it.each([false, true])(
        "keeps deleted equipment history but selects it only for finalized tickets (finalized=%s)",
        (finalized) => {
            const ticket = bagadAssoTicketWithEquipmentsRecord({
                validated: finalized ? new Date() : null
            })
            ticket.equipments[0].equipment.deletedAt = new Date()
            ticket.equipments[0].includedInContract = true
            const [line] = mapTicketEquipment(ticket)
            expect(line.name).toBe("Barnum")
            expect(line.deletedAt).toBeInstanceOf(Date)
            expect(line.checked).toBe(finalized)
        }
    )

    it("preserves an image path", () => {
        expect(
            mapTicketEquipment(bagadAssoTicketWithEquipmentsRecord())[0]
                ?.imagePath
        ).toBe("old.png")
    })

    it("computes the allocated deposit synchronously without a catalogue query", () => {
        const ticket = bagadAssoTicketWithEquipmentsRecord({
            equipments: [
                {
                    ...bagadAssoTicketEquipmentRecord({
                        requestedQuantity: 10,
                        allocatedQuantity: 3
                    }),
                    equipment: bagadAssoEquipmentRecord({ deposit: 50 })
                },
                {
                    ...bagadAssoTicketEquipmentRecord({
                        equipmentId: 2,
                        allocatedQuantity: 2
                    }),
                    equipment: bagadAssoEquipmentRecord({
                        id: 2,
                        deposit: 12.5
                    })
                }
            ]
        })
        expect(computeTotalDeposit(ticket)).toBe(175)
        expect(h.findMany).not.toHaveBeenCalled()
        expect(
            computeTotalDeposit(
                bagadAssoTicketWithEquipmentsRecord({ equipments: [] })
            )
        ).toBe(0)
    })
})

describe("getNextBookingsByEquipment", () => {
    it("queries upcoming, non-archived tickets and relational quantities in date order", async () => {
        h.findMany.mockResolvedValue([])
        expect((await getNextBookingsByEquipment()).size).toBe(0)
        expect(h.findMany).toHaveBeenCalledWith({
            where: { deleted: null, eventDate: { gte: expect.any(Date) } },
            orderBy: { eventDate: "asc" },
            select: {
                id: true,
                association: true,
                eventName: true,
                eventDate: true,
                validated: true,
                equipments: {
                    select: {
                        equipmentId: true,
                        requestedQuantity: true,
                        allocatedQuantity: true,
                        includedInContract: true
                    }
                }
            }
        })
    })

    it("keeps the soonest booking and uses requested quantities before validation", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketWithEquipmentsRecord({
                id: 10,
                association: "Soonest",
                equipments: [
                    {
                        ...bagadAssoTicketEquipmentRecord({
                            requestedQuantity: 5,
                            allocatedQuantity: 1
                        }),
                        equipment: bagadAssoEquipmentRecord()
                    }
                ]
            }),
            bagadAssoTicketWithEquipmentsRecord({
                id: 11,
                association: "Later"
            })
        ])
        const bookings = await getNextBookingsByEquipment()
        expect(bookings.get(1)).toEqual({
            ticketId: 10,
            association: "Soonest",
            eventName: "Gala annuel",
            eventDate: new Date("2026-09-01T00:00:00Z"),
            quantity: 5
        })
        expect(bookings.has(99)).toBe(false)
    })

    it("uses validated allocations and distinguishes exclusions from unrecorded inclusion", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketWithEquipmentsRecord({
                validated: new Date(),
                equipments: [true, false, null].map(
                    (includedInContract, index) => ({
                        ...bagadAssoTicketEquipmentRecord({
                            equipmentId: index + 1,
                            requestedQuantity: 10,
                            allocatedQuantity: 3,
                            includedInContract
                        }),
                        equipment: bagadAssoEquipmentRecord({ id: index + 1 })
                    })
                )
            }),
            bagadAssoTicketWithEquipmentsRecord({
                id: 2,
                equipments: [
                    {
                        ...bagadAssoTicketEquipmentRecord({ equipmentId: 2 }),
                        equipment: bagadAssoEquipmentRecord({ id: 2 })
                    }
                ]
            })
        ])
        const bookings = await getNextBookingsByEquipment()
        expect(bookings.get(1)?.quantity).toBe(3)
        expect(bookings.get(2)?.ticketId).toBe(2)
        expect(bookings.get(3)?.quantity).toBe(3)
    })

    it("does not reserve zero allocations or hide a later booking", async () => {
        const ticket = bagadAssoTicketWithEquipmentsRecord()
        h.findMany.mockResolvedValue([
            {
                ...ticket,
                validated: new Date(),
                equipments: ticket.equipments.map((line) => ({
                    ...line,
                    allocatedQuantity: 0,
                    includedInContract: true
                }))
            },
            { ...ticket, id: 2 }
        ])
        expect((await getNextBookingsByEquipment()).get(1)?.ticketId).toBe(2)
    })
})
