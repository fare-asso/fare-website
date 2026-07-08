import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function switchVisibilityActionImpl(
    articleId: number,
    context: ActionAPIContext
): Promise<{ error?: string }> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
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
        return { error: "Echec du changement de visibilité de l'article" }
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
        return { error: "Echec du changement de visibilité de l'article" }
    }

    return {}
}

export const switchVisibilityAction = wrapAction(
    "switchVisibilityAction",
    switchVisibilityActionImpl
)
