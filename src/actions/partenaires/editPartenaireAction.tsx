"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function editPartenaireActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:partner")) {
        return {
            error: "Vous n'avez pas la permission de modifier des partenaires"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const id = Number(formData.get("id")?.toString() ?? Number.NaN)
    const name = formData.get("name")?.toString()
    const description = formData.get("description")?.toString()
    const logoPicture = formData.get("logo-picture")

    // fetch current partenaire logo path
    const currentPartenaire = await prisma.partenaire.findUnique({
        where: {
            id: id
        },
        select: {
            logoPath: true,
        }
    })

    // validate current partenaire
    if (!currentPartenaire)
        return {
            error: "Echec de la récupération des informations du partenaire"
        }

    // Fields Validation
    if (
        Number.isNaN(id) ||
        !name ||
        !description ||
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
        .from("partner-pictures")
        .update(currentPartenaire.logoPath, file)
    if (err) return { error: err.message }

    const logoPath: string = data.path

    try {
        const editedPartenaire = await prisma.partenaire.update({
            where: {
                id: id
            },
            data: {
                name,
                description: description,
                logoPath,
            }
        })

        if (editedPartenaire) {
            revalidatePath("/dashboard/partenaires")
            revalidatePath("/a-propos/partenaires")
            return { success: true }
        } else {
            return {
                error: "La modification du partenaire dans la base de données a échoué... Veuillez contacter un administrateur."
            }
        }
    } catch (error) {
        captureActionError(error)
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
        return { error: errorMessage }
    }
}

export default withServerAction(
    "editPartenaireActionImplAction",
    editPartenaireActionImpl,
    { attachFormData: true }
)
