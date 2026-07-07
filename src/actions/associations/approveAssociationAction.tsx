import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const approveAssociationAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "approveAssociationAction",
            async ({
                data: id
            }): Promise<{ error?: string; success?: boolean }> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { error: "Authentification requise" }
                }
                if (!hasPermission(user, "approve:association")) {
                    return {
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
                    return { error: "Échec de l'approbation de l'association" }
                }
                const association = associationResult.value

                if (!association) {
                    return { error: "Association introuvable" }
                }

                if (association.approved) {
                    return { error: "Cette association est déjà approuvée" }
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
                    return { error: "Échec de l'approbation de l'association" }
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
                            error: "Échec de l'approbation de l'association"
                        }
                    }
                }

                return { success: true }
            }
        )
    )
