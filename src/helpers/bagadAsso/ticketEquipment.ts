import type { Prisma } from "@/generated/prisma/client"

export const ticketEquipmentInclude = {
    equipments: {
        orderBy: { equipmentId: "asc" },
        include: { equipment: true }
    }
} satisfies Prisma.BagadAssoTicketInclude

export type TicketWithEquipment = Prisma.BagadAssoTicketGetPayload<{
    include: typeof ticketEquipmentInclude
}>

export type TicketEquipmentLine = {
    id: number
    requestedQuantity: number
    allocatedQuantity: number
    includedInContract: boolean | null
    deposit: number
    name: string
    imagePath: string | undefined
    checked?: boolean
}

export function mapTicketEquipment(
    ticket: TicketWithEquipment
): TicketEquipmentLine[] {
    return ticket.equipments.map((line) => ({
        id: line.equipmentId,
        requestedQuantity: line.requestedQuantity,
        allocatedQuantity: line.allocatedQuantity,
        includedInContract: line.includedInContract,
        deposit: line.equipment.deposit,
        name: line.equipment.name,
        imagePath: line.equipment.imagePath ?? undefined,
        checked: line.includedInContract === true
    }))
}
