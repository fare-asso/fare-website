import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type DeletePartenaireResult =
    | { success: true }
    | { success: false; error: string }

export const deletePartenaireAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "deletePartenaireAction",
            async ({ data: id }): Promise<DeletePartenaireResult> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "delete:partner")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des partenaires"
                    }
                }

                const supabase = createClient()

                const partenaire = await tryCatch(
                    prisma.partenaire.findUnique({ where: { id } })
                )
                if (!partenaire.success) {
                    captureActionError(partenaire.error)
                    return {
                        success: false,
                        error: "Echec de la suppression du partenaire"
                    }
                }
                if (partenaire.value === null) {
                    return { success: false, error: "Partenaire introuvable." }
                }

                if (partenaire.value.logoPath.length > 0) {
                    const removed = await tryCatch(
                        supabase.storage
                            .from("partner-pictures")
                            .remove([partenaire.value.logoPath])
                    )
                    if (!removed.success) {
                        captureActionError(removed.error)
                        return {
                            success: false,
                            error: "Echec de la suppression du logo dans la base de données"
                        }
                    }
                }

                const deleted = await tryCatch(
                    prisma.partenaire.delete({ where: { id } })
                )
                if (!deleted.success) {
                    captureActionError(deleted.error)
                    return {
                        success: false,
                        error: "Echec de la suppression du partenaire"
                    }
                }

                return { success: true }
            }
        )
    )
