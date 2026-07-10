import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteArticleActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:article")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des articles"
        }
    }

    // create supabase client
    const supabase = createClient(context)

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
        return { success: false, error: "Echec de la suppression de l'article" }
    }
    const article = articleResult.value

    if (article == null) {
        return { success: false, error: "Echec de la suppression de l'article" }
    }

    /* Remove pictures from storage if there is some */
    if (article.imagesPath.length > 0) {
        const { error } = await supabase.storage
            .from("article-pictures")
            .remove(article.imagesPath)

        if (error) {
            console.error(error.message)
            return {
                success: false,
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
        return { success: false, error: "Echec de la suppression de l'article" }
    }
    return { success: true }
}

export const deleteArticleAction = wrapAction(
    "deleteArticleAction",
    deleteArticleActionImpl
)
