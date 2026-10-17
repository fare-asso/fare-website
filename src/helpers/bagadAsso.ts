import type { BagadAssoTicket } from "@/generated/prisma/client"
import type { TicketWithEquipment } from "@/helpers/bagadAsso/ticketEquipment"
import type { Prettify } from "@/lib/utils"

import prisma from "./db"

export type EquipmentNextBooking = Prettify<
    Pick<BagadAssoTicket, "association" | "eventName" | "eventDate"> & {
        ticketId: BagadAssoTicket["id"]
        quantity: number
    }
>

/** Map each equipment id to its soonest upcoming, non-archived booking. */
export async function getNextBookingsByEquipment(): Promise<
    Map<number, EquipmentNextBooking>
> {
    const tickets = await prisma.bagadAssoTicket.findMany({
        where: { deleted: null, eventDate: { gte: new Date() } },
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

    const bookings = new Map<number, EquipmentNextBooking>()
    for (const ticket of tickets) {
        for (const line of ticket.equipments) {
            // An unrecorded inclusion is not an explicit exclusion.
            if (ticket.validated && line.includedInContract === false) continue
            const quantity = ticket.validated
                ? line.allocatedQuantity
                : line.requestedQuantity
            if (quantity <= 0 || bookings.has(line.equipmentId)) continue
            bookings.set(line.equipmentId, {
                ticketId: ticket.id,
                association: ticket.association,
                eventName: ticket.eventName,
                eventDate: ticket.eventDate,
                quantity
            })
        }
    }

    return bookings
}

export function computeTotalDeposit(ticket: TicketWithEquipment): number {
    return ticket.equipments.reduce(
        (total, line) =>
            total + line.allocatedQuantity * line.equipment.deposit,
        0
    )
}
