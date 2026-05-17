"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
        // Fetch current article
        const article = await prisma.article.findUnique({
            where: {
                id: articleId
            },
            select: {
                published: true
            }
        })

        if (!article) {
            return { error: "Article non trouvé" }
        }

        await prisma.article.update({
            where: {
                id: articleId
            },
            data: {
                published: !article.published
            }
        })
    } catch (error) {
        captureActionError(error)
        return { error: "Echec du changement de visibilité de l'article" }
    }

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")

    return {}
}

export default withServerAction(
    "switchVisibilityAction",
    switchVisibilityActionImpl
)
