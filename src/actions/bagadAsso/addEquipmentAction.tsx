"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function addEquipmentActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:bagad-equipment")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const name = formData.get("name")?.toString()
    const image = formData.get("equipment-picture")
    const quantity = formData.get("quantity")?.toString()
    const guarantee = formData.get("guarantee")?.toString()

    // data validation
    if (!name || !quantity || !guarantee) {
        return {
            error: "Un ou plusieurs champs ne sont pas remplis."
        }
    }

    // Name
    if (name.length === 0)
        return { error: "La longueur du nom ne doit pas être vide" }

    // Quantity
    if (Number.isNaN(Number(quantity)))
        return { error: "Champs 'quantité' non-valide." }

    // Guarantee
    if (Number.isNaN(Number(guarantee)))
        return { error: "Champs 'caution' non-valide." }

    // Image
    let imagePath: string | null = null
    const maxFileSize: number = 25 * 1024 * 1024 // max image size in bytes (25MB)
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ]
    if (image instanceof File && image.size > 0) {
        // check file size and format
        if (
            image.size > maxFileSize ||
            !allowedMimeTypes.includes(image.type)
        ) {
            return {
                error: "La taille ou le format de l'image n'est pas valide. La taille doit être inférieure à 25mo et les formats supportés sont \"jpg, jpeg, png, gif et webp\"."
            }
        }

        // upload file
        const fileExt = image.name.split(".").pop()
        const filePath = `${randomUUID()}.${fileExt}`
        const { error, data } = await supabase.storage
            .from("equipment-pictures")
            .upload(filePath, image, {
                contentType: image.type
            })

        if (error) return { error: error.message }

        imagePath = data?.path ?? null
    }

    // create new record
    const created = await tryCatch(
        prisma.bagadAssoEquipment.create({
            data: {
                name,
                deposit: Number(guarantee),
                quantity: Number(quantity),
                imagePath
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        }
    }

    revalidatePath("/dashboard/bagadAsso")
    revalidatePath("/projets/bagad-asso")
    return { success: true }
}

export default withServerAction("addEquipmentAction", addEquipmentActionImpl, {
    attachFormData: true
})
