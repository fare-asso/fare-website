import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function switchVisibilityActionImpl(
    articleId: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "publish:article")) {
        return {
            success: false,
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
            success: false,
            error: "Echec du changement de visibilité de l'article"
        }
    }
    const article = articleResult.value

    if (!article) {
        return { success: false, error: "Article non trouvé" }
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
            success: false,
            error: "Echec du changement de visibilité de l'article"
        }
    }

    return { success: true }
}

export const switchVisibilityAction = wrapAction(
    "switchVisibilityAction",
    switchVisibilityActionImpl
)
