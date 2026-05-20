"use server"

import type { JSONContent } from "@tiptap/react"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function editArticleActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:article")) {
        return {
            error: "Vous n'avez pas la permission de modifier des articles"
        }
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
    const articleResult = await tryCatch(
        prisma.article.findUnique({
            where: {
                id: articleId
            },
            select: {
                id: true,
                imagesPath: true
            }
        })
    )
    if (!articleResult.success) {
        captureActionError(articleResult.error)
        return { error: "Echec de la modification de l'article" }
    }
    const article = articleResult.value

    if (!article) {
        return { error: "Article not found" }
    }

    // Delete previous images from storage
    const removed = await tryCatch(
        supabase.storage.from("article-pictures").remove(article.imagesPath)
    )
    if (!removed.success) {
        captureActionError(removed.error)
        return { error: "Echec de la modification de l'article" }
    }

    // Images
    const images = formData.getAll("images") as File[]

    // upload images to storage
    const responsesResult = await tryCatch(
        Promise.all(
            images.map(
                async (file) =>
                    await supabase.storage
                        .from("article-pictures")
                        .upload(file.name, file)
            )
        )
    )
    if (!responsesResult.success) {
        captureActionError(responsesResult.error)
        return { error: "Echec de la modification de l'article" }
    }
    const responses = responsesResult.value

    // check for errors
    for (const response of responses) {
        if (response.error) {
            return {
                error: "L'upload des images a échoué. Veuillez réessayer"
            }
        }
    }

    const parsedContent = tryCatch(() => JSON.parse(content) as JSONContent)
    if (!parsedContent.success) {
        return { error: "Le contenu de l'article est invalide" }
    }

    // insert article to database
    const updated = await tryCatch(
        prisma.article.update({
            where: {
                id: articleId
            },
            data: {
                title: title,
                content: parsedContent.value,
                imagesPath: responses
                    .map((response) => response.data?.path)
                    .filter((path): path is string => path !== undefined)
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return { error: "Echec de la modification de l'article" }
    }

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")

    return { success: true }
}

export default withServerAction("editArticleAction", editArticleActionImpl, {
    attachFormData: true
})
