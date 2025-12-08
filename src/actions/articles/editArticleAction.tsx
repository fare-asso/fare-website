"use server"

import type { JSONContent } from "@tiptap/react"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function editArticleAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()
    const articleId = Number(formData.get("id")?.toString())

    // Ensure articleId is a number
    if (Number.isNaN(articleId)) {
        return { error: "L'id de l'article est eronné" }
    }

    // Fields Validation
    if (!title || !content) {
        return { error: "Veuillez remplir tous les champs obligatoires." }
    }

    // Fetch current article
    const article = await prisma.article.findUnique({
        where: {
            id: articleId
        },
        select: {
            id: true,
            imagesPath: true
        }
    })

    if (!article) {
        return { error: "Article not found" }
    }

    // Delete previous images from storage
    const _deleteResponses = await supabase.storage
        .from("article-pictures")
        .remove(article?.imagesPath)

    // Images
    const images = formData.getAll("images") as File[]
    for (const image of images) {
        console.log(image)
    }

    // upload images to storage
    const responses = await Promise.all(
        images.map(
            async (file) =>
                await supabase.storage
                    .from("article-pictures")
                    .upload(file.name, file)
        )
    )

    // check for errors
    for (const response of responses) {
        if (response.error) {
            return {
                error: "L'upload des images a échoué. Veuillez réessayer"
            }
        }
    }

    const contentDelta: JSONContent = JSON.parse(content)

    // insert article to database
    const _record = await prisma.article.update({
        where: {
            id: articleId
        },
        data: {
            title: title,
            content: contentDelta,
            imagesPath: responses
                .map((response) => response.data?.path)
                .filter((path): path is string => path !== undefined)
        }
    })

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")

    return { success: true }
}
