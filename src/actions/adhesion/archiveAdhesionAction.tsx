"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export default async function archiveAdhesionAction(
    adhesionId: number
): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:adhesion")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    try {
        await prisma.adhesion.update({
            where: {
                id: adhesionId
            },
            data: {
                archived: new Date()
            }
        })

        revalidatePath("/dashboard/adhesions")

        return { success: true }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error)
        return { error: "Echec de l'archivage de la demande d'adhésion" }
    }
}
