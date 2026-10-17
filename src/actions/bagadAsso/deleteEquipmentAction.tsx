import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const EquipmentId = type("0 < number.integer <= 2147483647")

async function deleteEquipmentActionImpl(
    equipmentId: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "delete:bagad-equipment")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }
    const id = EquipmentId(equipmentId)
    if (id instanceof type.errors) {
        return { success: false, error: "Identifiant de matériel invalide" }
    }
    // Keep the row and its image so historical tickets retain their references.
    const deleted = await tryCatch(() =>
        prisma.bagadAssoEquipment.updateMany({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'équipement"
        }
    }
    if (deleted.value.count !== 1) {
        return {
            success: false,
            error: "Équipement introuvable ou déjà supprimé."
        }
    }
    return { success: true }
}

export const deleteEquipmentAction = wrapAction(
    "deleteEquipmentAction",
    deleteEquipmentActionImpl
)
