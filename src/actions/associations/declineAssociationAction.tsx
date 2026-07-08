import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function declineAssociationActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "approve:association")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de refuser des associations"
        }
    }

    const associationResult = await tryCatch(
        prisma.association.findUnique({
            where: { id }
        })
    )
    if (!associationResult.success) {
        captureActionError(associationResult.error)
        return { success: false, error: "Échec du refus de l'association" }
    }
    const association = associationResult.value

    if (!association) {
        return { success: false, error: "Association introuvable" }
    }

    if (association.approved) {
        return {
            success: false,
            error: "Impossible de refuser une association déjà approuvée"
        }
    }

    // Remove logo from association-pictures storage
    if (association.logoPath.length > 0) {
        const supabase = createClient(context)
        const { error: storageError } = await supabase.storage
            .from("association-pictures")
            .remove([association.logoPath])

        if (storageError) {
            console.error(
                "Failed to remove association logo:",
                storageError.message
            )
        }
    }

    // Delete the pending association record
    const deleted = await tryCatch(
        prisma.association.delete({
            where: { id }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { success: false, error: "Échec du refus de l'association" }
    }

    return { success: true }
}

export const declineAssociationAction = wrapAction(
    "declineAssociationAction",
    declineAssociationActionImpl
)
