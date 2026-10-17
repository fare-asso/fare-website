import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import { ticketEquipmentInclude } from "@/helpers/bagadAsso/ticketEquipment"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const PositiveInt = type("0 < number.integer <= 2147483647")
const UpdateTicketEquipmentQuantitySchema = type({
    ticketId: PositiveInt,
    equipmentId: PositiveInt,
    quantity: PositiveInt
})

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
        prisma.bagadAssoTicket.findUnique({
            where: { id: data.ticketId },
            include: ticketEquipmentInclude
        })
    )
    if (!found.success) {
        captureActionError(found.error)
        return { success: false, error: "Echec de la récupération du ticket" }
    }
    const ticket = found.value
    if (!ticket) return { success: false, error: "Ticket introuvable" }
    if (ticket.deleted || ticket.validated) {
        return { success: false, error: "Ce ticket ne peut plus être modifié" }
    }

    const line = ticket.equipments.find(
        (item) => item.equipmentId === data.equipmentId
    )
    if (!line) return { success: false, error: "Matériel absent du ticket" }
    if (line.equipment.deletedAt) {
        return { success: false, error: "Ce matériel a été supprimé" }
    }
    if (data.quantity > line.equipment.quantity) {
        return {
            success: false,
            error: "La quantité demandée dépasse le stock disponible"
        }
    }

    const saved = await tryCatch(() =>
        prisma.$transaction(
            async (tx): Promise<ActionResult<{ quantity: number }>> => {
                // Serialize allocation edits and contract finalization on the parent row.
                const claim = await tx.bagadAssoTicket.updateMany({
                    where: {
                        id: ticket.id,
                        deleted: null,
                        validated: null,
                        equipmentRevision: ticket.equipmentRevision
                    },
                    data: { equipmentRevision: { increment: 1 } }
                })
                if (claim.count !== 1) {
                    return {
                        success: false,
                        error: "Ce ticket a été modifié entre-temps. Veuillez le recharger."
                    }
                }
                await tx.bagadAssoTicketEquipment.update({
                    where: {
                        ticketId_equipmentId: {
                            ticketId: ticket.id,
                            equipmentId: data.equipmentId
                        }
                    },
                    data: { allocatedQuantity: data.quantity }
                })
                return { success: true, value: { quantity: data.quantity } }
            }
        )
    )
    if (!saved.success) {
        captureActionError(saved.error)
        return { success: false, error: "Echec de la mise à jour du ticket" }
    }
    return saved.value
}

export const updateTicketEquipmentQuantityAction = wrapAction(
    "updateTicketEquipmentQuantityAction",
    updateTicketEquipmentQuantityActionImpl
)
