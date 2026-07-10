import { randomUUID } from "node:crypto"

import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function addAssociationActionImpl(
    formData: FormData,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:association")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des associations"
        }
    }

    // create supabase client
    const supabase = createClient(context)

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
        return {
            success: false,
            error: "Veuillez remplir tous les champs obligatoires."
        }
    }

    const maxFileSize = 15 // max file size in mb

    // Logo Picture
    if (!(logoPicture instanceof File))
        return { success: false, error: "Logo non-valide." }

    const file: File = logoPicture

    // size validation
    if (file.size === 0 || file.size / (1024 * 1024) > maxFileSize) {
        return {
            success: false,
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
            success: false,
            error: "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF"
        }
    }

    // upload logo picture
    const { data, error: err } = await supabase.storage
        .from("association-pictures")
        .upload(randomUUID(), file)
    if (err) return { success: false, error: err.message }

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
        return { success: false, error: errorMessage }
    }

    if (created.value) {
        return { success: true }
    } else {
        return {
            success: false,
            error: "La création de l'association dans la base de données a échoué... Veuillez contacter un administrateur."
        }
    }
}

export const addAssociationAction = wrapAction(
    "addAssociationAction",
    addAssociationActionImpl
)
