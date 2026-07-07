import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteMemberAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction("deleteMemberAction", async ({ data: { id } }) => {
            // Auth and permission verifications
            const user = await getCurrentUserWithPermissions()
            if (!user) {
                return { error: "Authentification requise" }
            }
            if (!hasPermission(user, "delete:member")) {
                return {
                    error: "Vous n'avez pas la permission de supprimer des membres"
                }
            }

            // create supabase client
            const supabase = createClient()

            const deleted = await tryCatch(
                prisma.member.delete({
                    where: { id: id }
                })
            )
            if (!deleted.success) {
                captureActionError(deleted.error)
                return { error: "Echec de la suppression du membre" }
            }
            const res = deleted.value

            if (res == null) return { error: "Failed to delete record" }

            // successfully deleted
            const { error } = await supabase.storage
                .from("member-pictures")
                .remove([res.picturePath])

            if (error) {
                return { error: error.message }
            }

            return { success: true }
        })
    )
