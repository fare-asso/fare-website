import type {
    BagadAssoTicket,
    BagadAssoEquipment
} from "@/generated/prisma/client"
import { tryCatch, type Prettify } from "@/lib/utils"

import prisma from "./db"

type Equipement = Pick<BagadAssoEquipment, "id" | "quantity">

export type EquipmentNextBooking = Prettify<
    Pick<BagadAssoTicket, "association" | "eventName" | "eventDate"> & {
        ticketId: BagadAssoTicket["id"]
        quantity: number
    }
>

/**
 * Map each equipment id to its soonest upcoming, non-archived booking.
 * Tickets are scanned in ascending event-date order, so the first one that
 * references an equipment is its next reservation.
 */
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
            equipments: true
        }
    })

    const bookings = new Map<number, EquipmentNextBooking>()
    for (const ticket of tickets) {
        const parsed = tryCatch(
            () =>
                JSON.parse(
                    ticket.equipments?.toString() ?? "[]"
                ) as Equipement[]
        )
        if (!parsed.success || !Array.isArray(parsed.value)) continue

        for (const entry of parsed.value) {
            if (
                typeof entry?.id !== "number" ||
                typeof entry?.quantity !== "number"
            ) {
                continue
            }
            if (bookings.has(entry.id)) continue
            bookings.set(entry.id, {
                ticketId: ticket.id,
                association: ticket.association,
                eventName: ticket.eventName,
                eventDate: ticket.eventDate,
                quantity: entry.quantity
            })
        }
    }

    return bookings
}

export async function computeTotalDeposit(
    ticket: BagadAssoTicket
): Promise<number> {
    const equipments: Equipement[] = JSON.parse(
        ticket.equipments?.toString() ?? "[]"
    )

    const equipmentIds: number[] = equipments.map((e) => e.id)

    const equipmentData = await prisma.bagadAssoEquipment.findMany({
        where: {
            id: { in: equipmentIds }
        },
        select: {
            id: true,
            deposit: true
        }
    })

    // Création d'une map pour accéder rapidement aux dépôts par id
    const depositMap = equipmentData.reduce(
        (map, equipment) => {
            map[equipment.id] = equipment.deposit
            return map
        },
        {} as Record<number, number>
    )

    // Calcul du dépôt total en utilisant la quantité et le dépôt de chaque équipement
    const totalDeposit = equipments.reduce((total, equipement) => {
        const deposit = depositMap[equipement.id] || 0 // Si pas de dépôt trouvé, considérer 0
        return total + equipement.quantity * deposit
    }, 0)

    return totalDeposit
}

export async function joinTicketAndEquipment(
    ticket: BagadAssoTicket
): Promise<BagadAssoTicket> {
    const equipments: Equipement[] = JSON.parse(
        ticket.equipments?.toString() ?? "[]"
    )
    const equipmentIds: number[] = equipments.map((e) => e.id)

    // Requête pour récupérer les informations détaillées des équipements depuis la base de données
    const equipmentData = await prisma.bagadAssoEquipment.findMany({
        where: {
            id: { in: equipmentIds }
        },
        select: {
            id: true,
            deposit: true,
            name: true,
            imagePath: true
        }
    })

    // Créer un map pour un accès rapide aux données d'équipement
    const equipmentMap = new Map(equipmentData.map((e) => [e.id, e]))

    // Mettre à jour les équipements du ticket avec les données détaillées
    const updatedEquipments = equipments.map((e) => ({
        ...e,
        ...equipmentMap.get(e.id)
    }))

    // Retourner le ticket mis à jour avec les équipements détaillés
    return {
        ...ticket,
        equipments: updatedEquipments
    }
}
