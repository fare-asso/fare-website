import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteCDPAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction("deleteCDPAction", async ({ data: { id } }) => {
            // Auth and permission verifications
            const user = await getCurrentUserWithPermissions()
            if (!user) {
                return { error: "Authentification requise" }
            }
            if (!hasPermission(user, "delete:cdp")) {
                return {
                    error: "Vous n'avez pas la permission de supprimer des communiqués de presse"
                }
            }

            // create supabase client
            const supabase = createClient()

            // Delete Record from DB
            const deleted = await tryCatch(
                prisma.communiqueDePresse.delete({
                    where: {
                        id: id
                    }
                })
            )
            if (!deleted.success) {
                captureActionError(deleted.error)
                return {
                    error: "Echec de la suppression du communiqué de presse"
                }
            }
            const deletedCdpRecord = deleted.value

            if (deletedCdpRecord == null) {
                return {
                    error: "Echec de la suppression du communiqué de presse"
                }
            }

            // remove file from storage
            const { error: err } = await supabase.storage
                .from("communique-de-presse")
                .remove([deletedCdpRecord.filePath])

            if (err) {
                console.error(err.message)
                return {
                    error: "Echec de la suppression du communiqué de presse dans le stockage"
                }
            } else {
                // success

                // revalidate Path
                return {
                    success: true
                }
            }
        })
    )
