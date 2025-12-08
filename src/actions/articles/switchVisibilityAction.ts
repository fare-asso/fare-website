"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import getCurrentUserRole from "@/helpers/user/role"

export default async function switchVisibilityAction(articleId: number) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

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
        throw new Error("Article not found")
    }

    await prisma.article.update({
        where: {
            id: articleId
        },
        data: {
            published: !article.published
        }
    })

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")
}
