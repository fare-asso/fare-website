import type { ActionAPIContext } from "astro:actions"

import type { Article } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchArticles(): Promise<Article[] | null> {
    const articles = await tryCatch(
        prisma.article.findMany({ orderBy: { writtenOn: "desc" } })
    )
    if (!articles.success) {
        captureActionError(articles.error)
        return null
    }
    return articles.value
}

async function listArticlesActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<Article[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:articles")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const articles = await fetchArticles()
    if (!articles) {
        return { success: false, error: "Échec du chargement des articles." }
    }
    return { success: true, value: articles }
}

export const listArticlesAction = wrapAction(
    "listArticlesAction",
    listArticlesActionImpl
)
