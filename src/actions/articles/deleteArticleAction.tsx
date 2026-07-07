import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteArticleAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction("deleteArticleAction", async ({ data: id }) => {
            // Auth and permission verifications
            const user = await getCurrentUserWithPermissions()
            if (!user) {
                return { error: "Authentification requise" }
            }
            if (!hasPermission(user, "delete:article")) {
                return {
                    error: "Vous n'avez pas la permission de supprimer des articles"
                }
            }

            // create supabase client
            const supabase = createClient()

            // fetch article to delete
            const articleResult = await tryCatch(
                prisma.article.findUnique({
                    where: {
                        id: id
                    }
                })
            )
            if (!articleResult.success) {
                captureActionError(articleResult.error)
                return { error: "Echec de la suppression de l'article" }
            }
            const article = articleResult.value

            if (article == null) {
                return { error: "Echec de la suppression de l'article" }
            }

            /* Remove pictures from storage if there is some */
            if (article.imagesPath.length > 0) {
                const { error } = await supabase.storage
                    .from("article-pictures")
                    .remove(article.imagesPath)

                if (error) {
                    console.error(error.message)
                    return {
                        error: "Echec de la suppression des images dans la base de données"
                    }
                } // else success
            }

            // delete record
            const deleted = await tryCatch(
                prisma.article.delete({
                    where: {
                        id: id
                    }
                })
            )
            if (!deleted.success) {
                captureActionError(deleted.error)
                return { error: "Echec de la suppression de l'article" }
            }
            return { success: true }
        })
    )
