import { createServerFn } from "@tanstack/react-start"
import type { JSONContent } from "@tiptap/react"

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

async function createArticleActionImpl(
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
    const supabase = createClient()

    // retrieve form data fields
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    // Fields Validation
    if (!title || !content) {
        return { error: "Veuillez remplir tous les champs obligatoires." }
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
        return { error: "Le contenu de l'article est invalide" }
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

    return { success: true }
}

const createArticleActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof createArticleActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction("createArticleAction", createArticleActionImpl, {
            attachFormData: true
        })(
            ...unpackActionArgs<Parameters<typeof createArticleActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof createArticleActionImpl>
): ReturnType<typeof createArticleActionImpl> =>
    createArticleActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof createArticleActionImpl>
