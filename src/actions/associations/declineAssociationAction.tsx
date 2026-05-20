"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function declineAssociationActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
): Promise<{ error?: string; success?: boolean }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "approve:association")) {
        return {
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
        return { error: "Échec du refus de l'association" }
    }
    const association = associationResult.value

    if (!association) {
        return { error: "Association introuvable" }
    }

    if (association.approved) {
        return {
            error: "Impossible de refuser une association déjà approuvée"
        }
    }

    // Remove logo from association-pictures storage
    if (association.logoPath.length > 0) {
        const supabase = await createClient()
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
        return { error: "Échec du refus de l'association" }
    }

    revalidatePath("/dashboard/associations")
    revalidatePath("/reseau")
    revalidatePath("/")

    return { success: true }
}

export default withServerAction(
    "declineAssociationAction",
    declineAssociationActionImpl
)
