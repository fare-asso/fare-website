import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function approveAssociationActionImpl(
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
            error: "Vous n'avez pas la permission d'approuver des associations"
        }
    }

    const associationResult = await tryCatch(
        prisma.association.findUnique({
            where: { id }
        })
    )
    if (!associationResult.success) {
        captureActionError(associationResult.error)
        return {
            success: false,
            error: "Échec de l'approbation de l'association"
        }
    }
    const association = associationResult.value

    if (!association) {
        return { success: false, error: "Association introuvable" }
    }

    if (association.approved) {
        return { success: false, error: "Cette association est déjà approuvée" }
    }

    // Approve the association
    const approved = await tryCatch(
        prisma.association.update({
            where: { id },
            data: { approved: new Date() }
        })
    )
    if (!approved.success) {
        captureActionError(approved.error)
        return {
            success: false,
            error: "Échec de l'approbation de l'association"
        }
    }

    // Archive the linked adhesion if present
    if (association.adhesionId) {
        const archived = await tryCatch(
            prisma.adhesion.update({
                where: { id: association.adhesionId },
                data: { archived: new Date() }
            })
        )
        if (!archived.success) {
            captureActionError(archived.error)
            return {
                success: false,
                error: "Échec de l'approbation de l'association"
            }
        }
    }

    return { success: true }
}

export const approveAssociationAction = wrapAction(
    "approveAssociationAction",
    approveAssociationActionImpl
)
