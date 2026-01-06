"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function editEquipmentAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const equipmentId = formData.get("equipmentId")?.toString()
    const name = formData.get("name")?.toString()
    const image = formData.get("equipment-picture")
    const quantity = formData.get("quantity")?.toString()
    const guarantee = formData.get("guarantee")?.toString()
    const removeImage = formData.get("removeImage")?.toString() === "true"

    // data validation
    if (!equipmentId || !name || !quantity || !guarantee) {
        return {
            error: "Un ou plusieurs champs ne sont pas remplis."
        }
    }

    const equipmentIdNum = Number(equipmentId)
    if (Number.isNaN(equipmentIdNum)) {
        return { error: "ID de l'équipement invalide." }
    }

    // Fetch existing equipment
    const existingEquipment = await prisma.bagadAssoEquipment.findUnique({
        where: { id: equipmentIdNum }
    })

    if (!existingEquipment) {
        return { error: "Équipement non trouvé." }
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

    // Handle image
    let imagePath: string | null = existingEquipment.imagePath

    // If removing the image
    if (removeImage && existingEquipment.imagePath) {
        const { error } = await supabase.storage
            .from("equipment-pictures")
            .remove([existingEquipment.imagePath])

        if (error) {
            console.log(error.message)
            return {
                error: "Echec de la suppression de l'ancienne image"
            }
        }
        imagePath = null
    }

    // If uploading a new image
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

        // Delete old image if exists
        if (existingEquipment.imagePath) {
            await supabase.storage
                .from("equipment-pictures")
                .remove([existingEquipment.imagePath])
        }

        // upload new file
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

    // update record
    try {
        await prisma.bagadAssoEquipment.update({
            where: { id: equipmentIdNum },
            data: {
                name,
                deposit: Number(guarantee),
                quantity: Number(quantity),
                imagePath
            }
        })

        revalidatePath("/dashboard/bagadAsso")
        revalidatePath("/bagadAsso")
        return { success: true }
    } catch (_error) {
        // Failed
        return {
            error: "Echec de la modification de l'équipement. Veuillez réessayer."
        }
    }
}
