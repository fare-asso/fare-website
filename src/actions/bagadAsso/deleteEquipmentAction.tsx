import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteEquipmentActionImpl(
    equipmentId: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-equipment")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const equipmentResult = await tryCatch(
        prisma.bagadAssoEquipment.findUnique({ where: { id: equipmentId } })
    )
    if (!equipmentResult.success) {
        captureActionError(equipmentResult.error)
        return {
            success: false,
            error: "Echec de la suppression de l'équipement"
        }
    }
    const equipment = equipmentResult.value
    if (equipment == null) {
        return {
            success: false,
            error: "Echec de la suppression de l'équipement"
        }
    }

    const ticketLine = await tryCatch(
        prisma.bagadAssoTicketEquipment.findFirst({
            where: { equipmentId },
            select: { ticketId: true }
        })
    )
    if (!ticketLine.success) {
        captureActionError(ticketLine.error)
        return {
            success: false,
            error: "Echec de la vérification des réservations de l'équipement"
        }
    }
    if (ticketLine.value) {
        return {
            success: false,
            error: "Ce matériel est lié à des tickets et ne peut pas être supprimé."
        }
    }

    const supabase = createClient(context)
    /* Remove pictures from storage if there is some */
    if (equipment.imagePath) {
        const removed = await tryCatch(
            supabase.storage
                .from("equipment-pictures")
                .remove([equipment.imagePath])
        )

        if (!removed.success) {
            captureActionError(removed.error)
            return {
                success: false,
                error: "Echec de la suppression des images dans la base de données"
            }
        }
    }

    // delete record
    const deleted = await tryCatch(
        prisma.bagadAssoEquipment.delete({
            where: {
                id: equipmentId
            }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'équipement"
        }
    }
    return { success: true }
}

export const deleteEquipmentAction = wrapAction(
    "deleteEquipmentAction",
    deleteEquipmentActionImpl
)
