"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function approveAssociationActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
): Promise<{ error?: string; success?: boolean }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "approve:association")) {
        return {
            error: "Vous n'avez pas la permission d'approuver des associations"
        }
    }

    try {
        const association = await prisma.association.findUnique({
            where: { id }
        })

        if (!association) {
            return { error: "Association introuvable" }
        }

        if (association.approved) {
            return { error: "Cette association est déjà approuvée" }
        }

        // Approve the association
        await prisma.association.update({
            where: { id },
            data: { approved: new Date() }
        })

        // Archive the linked adhesion if present
        if (association.adhesionId) {
            await prisma.adhesion.update({
                where: { id: association.adhesionId },
                data: { archived: new Date() }
            })
            revalidatePath("/dashboard/adhesions")
        }

        revalidatePath("/dashboard/associations")
        revalidatePath("/reseau")
        revalidatePath("/")

        return { success: true }
    } catch (error) {
        captureActionError(error)
        return { error: "Échec de l'approbation de l'association" }
    }
}

export default withServerAction(
    "approveAssociationAction",
    approveAssociationActionImpl
)
