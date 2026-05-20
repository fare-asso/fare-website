"use server"

import type { JSONContent } from "@tiptap/react"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function createArticleActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: boolean }> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:article")) {
        return {
            error: "Vous n'avez pas la permission de créer des articles"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    // Fields Validation
    if (!title || !content) {
        return { error: "Veuillez remplir tous les champs obligatoires." }
    }

    // Images
    const images = formData.getAll("images") as File[]
    for (const image of images) {
        console.log(image)
    }

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
        return { error: "Echec de la création de l'article" }
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
        captureActionError(parsedContent.error)
        return { error: "Echec de la création de l'article" }
    }

    // insert article to database
    const created = await tryCatch(
        prisma.article.create({
            data: {
                title: title,
                content: parsedContent.value,
                imagesPath: responses
                    .map((response) => response.data?.path)
                    .filter((path): path is string => path !== undefined),
                authorId: user.id
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return { error: "Echec de la création de l'article" }
    }

    revalidatePath("/actualites")
    revalidatePath("/dashboard/articles")

    return { success: true }
}

export default withServerAction(
    "createArticleAction",
    createArticleActionImpl,
    { attachFormData: true }
)
