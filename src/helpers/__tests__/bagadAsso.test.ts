import { beforeEach, describe, expect, it, vi } from "vitest"

import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"
import { dbModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findMany: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoTicket: { findMany: h.findMany } })
)

import { getNextBookingsByEquipment } from "../bagadAsso"

beforeEach(() => {
    h.findMany.mockReset()
})

describe("getNextBookingsByEquipment", () => {
    it("queries only upcoming, non-archived tickets in event-date order", async () => {
        h.findMany.mockResolvedValue([])

        await getNextBookingsByEquipment()

        const arg = h.findMany.mock.calls[0][0]
        expect(arg.where.deleted).toBeNull()
        expect(arg.where.eventDate.gte).toBeInstanceOf(Date)
        expect(arg.orderBy).toEqual({ eventDate: "asc" })
    })

    it("maps each equipment to its soonest booking", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketRecord({
                id: 10,
                association: "Soonest",
                eventDate: new Date("2026-07-01T00:00:00Z"),
                equipments: JSON.stringify([
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 }
                ])
            }),
            bagadAssoTicketRecord({
                id: 11,
                association: "Later",
                eventDate: new Date("2026-08-01T00:00:00Z"),
                equipments: JSON.stringify([
                    { id: 1, quantity: 5 },
                    { id: 3, quantity: 1 }
                ])
            })
        ])

        const bookings = await getNextBookingsByEquipment()

        // equipment 1 appears in both → keeps the earlier ticket's data
        expect(bookings.get(1)).toEqual({
            ticketId: 10,
            association: "Soonest",
            eventName: "Gala annuel",
            eventDate: new Date("2026-07-01T00:00:00Z"),
            quantity: 2
        })
        expect(bookings.get(2)?.ticketId).toBe(10)
        expect(bookings.get(3)?.ticketId).toBe(11)
    })

    it("omits equipments without any upcoming booking", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketRecord({
                equipments: JSON.stringify([{ id: 1, quantity: 1 }])
            })
        ])

        const bookings = await getNextBookingsByEquipment()

        expect(bookings.has(1)).toBe(true)
        expect(bookings.has(99)).toBe(false)
    })

    it("tolerates malformed equipment payloads", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketRecord({ id: 1, equipments: "not json" }),
            bagadAssoTicketRecord({
                id: 2,
                equipments: JSON.stringify([{ id: 7, quantity: 3 }])
            })
        ])

        const bookings = await getNextBookingsByEquipment()

        expect(bookings.size).toBe(1)
        expect(bookings.get(7)?.quantity).toBe(3)
    })

    it("skips entries with a malformed shape", async () => {
        h.findMany.mockResolvedValue([
            bagadAssoTicketRecord({
                equipments: JSON.stringify([
                    { quantity: 2 }, // missing id
                    { id: 5 }, // missing quantity
                    { id: 8, quantity: 1 } // valid
                ])
            })
        ])

        const bookings = await getNextBookingsByEquipment()

        expect(bookings.size).toBe(1)
        expect(bookings.get(8)?.quantity).toBe(1)
    })
})
