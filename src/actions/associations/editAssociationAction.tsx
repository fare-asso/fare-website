import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function editAssociationActionImpl(
    formData: FormData,
    context: ActionAPIContext
) {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:association")) {
        return {
            error: "Vous n'avez pas la permission de modifier des associations"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // retrieve form data fields
    const id = Number(formData.get("id")?.toString() ?? Number.NaN)
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

    // fetch current association logo path
    const currentAssociation = await prisma.association.findUnique({
        where: {
            id: id
        },
        select: {
            logoPath: true,
            officePath: true
        }
    })

    // validate current association
    if (!currentAssociation)
        return {
            error: "Echec de la récupération des informations l'association"
        }

    // Fields Validation
    if (
        Number.isNaN(id) ||
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

    // update logo picture
    const { data, error: err } = await supabase.storage
        .from("association-pictures")
        .update(currentAssociation.logoPath, file)
    if (err) return { error: err.message }

    const logoPath: string = data.path

    const edited = await tryCatch(
        prisma.association.update({
            where: {
                id: id
            },
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
                discord
            }
        })
    )
    if (!edited.success) {
        captureActionError(edited.error)
        const errorMessage =
            edited.error instanceof Error
                ? edited.error.message
                : "Unknown error"
        return { error: errorMessage }
    }

    if (edited.value) {
        return { success: true }
    } else {
        return {
            error: "La modification de l'association dans la base de données a échoué... Veuillez contacter un administrateur."
        }
    }
}

export const editAssociationAction = wrapAction(
    "editAssociationAction",
    editAssociationActionImpl
)
