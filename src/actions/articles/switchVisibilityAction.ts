import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const switchVisibilityAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "switchVisibilityAction",
            async ({ data: articleId }): Promise<{ error?: string }> => {
                // Auth and permission verifications
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { error: "Authentification requise" }
                }
                if (!hasPermission(user, "publish:article")) {
                    return {
                        error: "Vous n'avez pas la permission de publier des articles"
                    }
                }

                // Fetch current article
                const articleResult = await tryCatch(
                    prisma.article.findUnique({
                        where: {
                            id: articleId
                        },
                        select: {
                            published: true
                        }
                    })
                )
                if (!articleResult.success) {
                    captureActionError(articleResult.error)
                    return {
                        error: "Echec du changement de visibilité de l'article"
                    }
                }
                const article = articleResult.value

                if (!article) {
                    return { error: "Article non trouvé" }
                }

                const updated = await tryCatch(
                    prisma.article.update({
                        where: {
                            id: articleId
                        },
                        data: {
                            published: !article.published
                        }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    return {
                        error: "Echec du changement de visibilité de l'article"
                    }
                }

                return {}
            }
        )
    )
