import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteArticleActionImpl(id: number) {
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
}

const deleteArticleActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteArticleActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteArticleAction",
            deleteArticleActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteArticleActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteArticleActionImpl>
): ReturnType<typeof deleteArticleActionImpl> =>
    deleteArticleActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteArticleActionImpl>
