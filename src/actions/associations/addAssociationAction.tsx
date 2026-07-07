import { randomUUID } from "node:crypto"

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

async function addAssociationActionImpl(formData: FormData) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:association")) {
        return {
            error: "Vous n'avez pas la permission de créer des associations"
        }
    }

    // create supabase client
    const supabase = createClient()

    // retrieve form data fields
    const name = formData.get("name")?.toString()
    const major = formData.get("major")?.toString()
    const description = formData.get("description")?.toString()
    const logoPicture = formData.get("logo-picture")
    const birthdate = formData.get("birthdate")?.toString()
    const location = formData.get("location")?.toString()
    const email = formData.get("email")?.toString()
    const website = formData.get("website")?.toString()
    const facebook = formData.get("facebook")?.toString()
    const instagram = formData.get("instagram")?.toString()
    const twitter = formData.get("twitter")?.toString()
    const discord = formData.get("discord")?.toString()

    // Fields Validation
    if (
        !name ||
        !major ||
        !description ||
        !birthdate ||
        !location ||
        !email ||
        !logoPicture
    ) {
        return { error: "Veuillez remplir tous les champs obligatoires." }
    }

    const maxFileSize = 15 // max file size in mb

    // Logo Picture
    if (!(logoPicture instanceof File)) return { error: "Logo non-valide." }

    const file: File = logoPicture

    // size validation
    if (file.size === 0 || file.size / (1024 * 1024) > maxFileSize) {
        return {
            error: `La taille de chaque photo doit être inférieure à ${maxFileSize} Mo.`
        }
    }

    // type validation
    if (
        ![
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif"
        ].includes(file.type)
    ) {
        return {
            error: "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF"
        }
    }

    // upload logo picture
    const { data, error: err } = await supabase.storage
        .from("association-pictures")
        .upload(randomUUID(), file)
    if (err) return { error: err.message }

    const logoPath: string = data.path

    // create new association record
    const created = await tryCatch(
        prisma.association.create({
            data: {
                name,
                major,
                desc: description,
                logoPath,
                birthdate: new Date(birthdate),
                location,
                email,
                website,
                facebook,
                instagram,
                twitter,
                discord,
                approved: new Date()
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        const errorMessage =
            created.error instanceof Error
                ? created.error.message
                : "Unknown error"
        return { error: errorMessage }
    }

    if (created.value) {
        return { success: true }
    } else {
        return {
            error: "La création de l'association dans la base de données a échoué... Veuillez contacter un administrateur."
        }
    }
}

const addAssociationActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof addAssociationActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction("addAssociationAction", addAssociationActionImpl, {
            attachFormData: true
        })(
            ...unpackActionArgs<Parameters<typeof addAssociationActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof addAssociationActionImpl>
): ReturnType<typeof addAssociationActionImpl> =>
    addAssociationActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof addAssociationActionImpl>
