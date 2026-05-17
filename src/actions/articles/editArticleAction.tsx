"use server"

import type { JSONContent } from "@tiptap/react"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
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
        await supabase.storage
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
        await prisma.article.update({
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
    } catch (error) {
        captureActionError(error)
        return { error: "Echec de la modification de l'article" }
    }

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")

    return { success: true }
}

export default withServerAction("editArticleAction", editArticleActionImpl, {
    attachFormData: true
})
