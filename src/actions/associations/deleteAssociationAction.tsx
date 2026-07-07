import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createAdminClient, createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteAssociationAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction("deleteAssociationAction", async ({ data: id }) => {
            // Auth and permission verifications
            const user = await getCurrentUserWithPermissions()
            if (!user) {
                return { error: "Authentification requise" }
            }
            if (!hasPermission(user, "delete:association")) {
                return {
                    error: "Vous n'avez pas la permission de supprimer des associations"
                }
            }

            // create supabase client
            const supabase = createClient()

            // create supabase admin client (only on server)
            const supabaseAdmin = createAdminClient()

            // fetch association to delete
            const association = await prisma.association.findUnique({
                where: {
                    id: id
                }
            })

            if (association == null) {
                return { error: "Echec de la suppression de l'association" }
            }

            /* Remove representative */
            if (association.representativeId) {
                const removed = await tryCatch(
                    supabaseAdmin.auth.admin.deleteUser(
                        association.representativeId
                    )
                )
                if (!removed.success) {
                    captureActionError(removed.error)
                    return {
                        error: "Echec de la suppression du compte représentant"
                    }
                }
            }

            /* Remove pictures from storage if there is some */
            if (association.logoPath.length > 0) {
                const { error } = await supabase.storage
                    .from("association-pictures")
                    .remove([association.logoPath])

                if (error) {
                    console.log(error.message)
                    return {
                        error: "Echec de la suppression des images dans la base de données"
                    }
                }
            }

            // delete record
            const deleted = await tryCatch(
                prisma.association.delete({
                    where: {
                        id: id
                    }
                })
            )
            if (!deleted.success) {
                captureActionError(deleted.error)
                return { error: "Echec de la suppression de l'association" }
            }
            return { success: true }
        })
    )
