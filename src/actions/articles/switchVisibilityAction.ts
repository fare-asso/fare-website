import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function switchVisibilityActionImpl(
    articleId: number
): Promise<{ error?: string }> {
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

const switchVisibilityActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof switchVisibilityActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "switchVisibilityAction",
            switchVisibilityActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof switchVisibilityActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof switchVisibilityActionImpl>
): ReturnType<typeof switchVisibilityActionImpl> =>
    switchVisibilityActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof switchVisibilityActionImpl>
