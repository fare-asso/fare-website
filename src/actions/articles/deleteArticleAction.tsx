"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function deleteArticleActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
) {
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
    const supabase = await createClient()

    try {
        // fetch article to delete
        const article = await prisma.article.findUnique({
            where: {
                id: id
            }
        })

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
        await prisma.article.delete({
            where: {
                id: id
            }
        })
        revalidatePath("/dashboard/articles")
        revalidatePath("/actualites")
        return { success: true }
    } catch (error) {
        captureActionError(error)
        return {
            error: "Echec de la suppression de l'article"
        }
    }
}

export default withServerAction("deleteArticleAction", deleteArticleActionImpl)
