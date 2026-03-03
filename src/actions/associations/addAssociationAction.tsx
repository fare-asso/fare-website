"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"

export default async function addAssociationAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
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
    const supabase = await createClient()

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
    try {
        const newAssociation = await prisma.association.create({
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

        if (newAssociation) {
            revalidatePath("/dashboard/associations")
            revalidatePath("/reseau")
            revalidatePath("/(home)")
            return { success: true }
        } else {
            return {
                error: "La création de l'association dans la base de données a échoué... Veuillez contacter un administrateur."
            }
        }
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
        return { error: errorMessage }
    }
}
