"use server"

import type { JSONContent } from "@tiptap/react"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
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
        await prisma.article.create({
            data: {
                title: title,
                content: contentDelta,
                imagesPath: responses
                    .map((response) => response.data?.path)
                    .filter((path): path is string => path !== undefined),
                authorId: user.id
            }
        })
    } catch (error) {
        captureActionError(error)
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
