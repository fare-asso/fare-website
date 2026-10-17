import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const PositiveSafeInteger = type("0 < number.integer <= 9007199254740991")
const UpdateTicketEquipmentQuantitySchema = type({
    ticketId: PositiveSafeInteger,
    equipmentId: PositiveSafeInteger,
    quantity: PositiveSafeInteger
})
const TicketEquipmentsSchema = type({
    id: PositiveSafeInteger,
    quantity: PositiveSafeInteger
}).array()

async function updateTicketEquipmentQuantityActionImpl(
    input: typeof UpdateTicketEquipmentQuantitySchema.infer,
    context: ActionAPIContext
): Promise<ActionResult<{ quantity: number }>> {
    const auth = await tryCatch(() => getUserWithPermissions(context))
    if (!auth.success) {
        captureActionError(auth.error)
        return { success: false, error: "Échec de l'authentification" }
    }
    const user = auth.value
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:bagad-ticket")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const data = UpdateTicketEquipmentQuantitySchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const found = await tryCatch(() =>
        prisma.bagadAssoTicket.findUnique({ where: { id: data.ticketId } })
    )
    if (!found.success) {
        captureActionError(found.error)
        return { success: false, error: "Echec de la récupération du ticket" }
    }
    const ticket = found.value
    if (!ticket) return { success: false, error: "Ticket introuvable" }
    if (ticket.deleted || ticket.validated) {
        return {
            success: false,
            error: "Ce ticket ne peut plus être modifié"
        }
    }

    const originalJsonValue = ticket.equipments
    if (originalJsonValue === null) {
        return { success: false, error: "Matériel du ticket invalide" }
    }
    const storedEquipments = tryCatch(() =>
        typeof originalJsonValue === "string"
            ? JSON.parse(originalJsonValue)
            : originalJsonValue
    )
    if (!storedEquipments.success) {
        captureActionError(storedEquipments.error)
        return { success: false, error: "Matériel du ticket invalide" }
    }
    const equipments = TicketEquipmentsSchema(storedEquipments.value)
    if (equipments instanceof type.errors) {
        return { success: false, error: "Matériel du ticket invalide" }
    }
    if (!equipments.some((item) => item.id === data.equipmentId)) {
        return { success: false, error: "Matériel absent du ticket" }
    }

    const foundEquipment = await tryCatch(() =>
        prisma.bagadAssoEquipment.findUnique({
            where: { id: data.equipmentId },
            select: { quantity: true }
        })
    )
    if (!foundEquipment.success) {
        captureActionError(foundEquipment.error)
        return { success: false, error: "Echec de la récupération du matériel" }
    }
    const equipment = foundEquipment.value
    if (!equipment) {
        return { success: false, error: "Matériel introuvable" }
    }
    if (data.quantity > equipment.quantity) {
        return {
            success: false,
            error: "La quantité demandée dépasse le stock disponible"
        }
    }

    const updatedEquipments = equipments.map((item) =>
        item.id === data.equipmentId
            ? { ...item, quantity: data.quantity }
            : item
    )
    const saved = await tryCatch(() =>
        prisma.bagadAssoTicket.updateMany({
            where: {
                id: ticket.id,
                deleted: null,
                validated: null,
                equipments: { equals: originalJsonValue }
            },
            data: {
                equipments:
                    typeof originalJsonValue === "string"
                        ? JSON.stringify(updatedEquipments)
                        : updatedEquipments
            }
        })
    )
    if (!saved.success) {
        captureActionError(saved.error)
        return { success: false, error: "Echec de la mise à jour du ticket" }
    }

    if (saved.value.count === 0) {
        return {
            success: false,
            error: "Ce ticket a été modifié entre-temps. Veuillez le recharger."
        }
    }

    return { success: true, value: { quantity: data.quantity } }
}

export const updateTicketEquipmentQuantityAction = wrapAction(
    "updateTicketEquipmentQuantityAction",
    updateTicketEquipmentQuantityActionImpl
)
