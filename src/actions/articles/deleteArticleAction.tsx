"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function deleteArticleAction(
    prevState: { error?: string; success?: boolean } | undefined,
    id: number
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

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
        const { data, error } = await supabase.storage
            .from("article-pictures")
            .remove(article.imagesPath)

        if (error) {
            console.log(error.message)
            return {
                error: "Echec de la suppression des images dans la base de données"
            }
        } // else success
    }

    // delete record
    try {
        const deletedRecord = await prisma.article.delete({
            where: {
                id: id
            }
        })
        revalidatePath("/dashboard/articles")
        revalidatePath("/actualites")
        return { success: true }
    } catch (error) {
        return {
            error: "Echec de la suppression de l'article"
        }
    }
}
