"use server"

import type { PresseType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"

function isPresseType(value: string): value is PresseType {
    return value === "CDP" || value === "DDP"
}

function getPresseType(formData: FormData): PresseType | undefined {
    const value = formData.get("CDPType")?.toString()

    if (value && isPresseType(value)) {
        return value
    }

    return undefined
}

export default async function createCDPAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:cdp")) {
        return {
            error: "Vous n'avez pas la permission de créer des communiqués de presse"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // retrieve form data fields
    const name = formData.get("name")?.toString()
    const file = formData.get("CDPfilePath")?.toString()
    const date = formData.get("date")?.toString()
    const type: PresseType | undefined = getPresseType(formData)

    // Required fields
    if (!name || !type || !file) {
        return { error: "Un ou plusieurs champs sont invalides" }
    }

    // Fetch file info before creating the record
    const { data, error: fetchError } = await supabase.storage
        .from("communique-de-presse")
        .info(file)
    if (fetchError) {
        return {
            error: "Une erreur est survenue lors de la récupération du fichier"
        }
    }

    const fileSize = data.size ?? 0 // in bytes
    const maxFileSize = 25 // in mb

    // Check file size
    if (fileSize === 0 || fileSize / (1024 * 1024) > maxFileSize) {
        return {
            error: `La taille du fichier doit être inférieure à ${maxFileSize}mo`
        }
    }

    // Check file format
    if (data.contentType !== "application/pdf") {
        return {
            error: "Le fichier doit être de format PDF"
        }
    }

    // Create a record for the new CDP (name, path, date?)
    const createdCDP = await prisma.communiqueDePresse.create({
        data: {
            name: name,
            filePath: file,
            size: fileSize,
            createdAt: date ? new Date(date) : new Date(),
            type: type
        }
    })

    if (createdCDP != null) {
        // successfully created the record
        // revalidate cdp page
        revalidatePath("/dashboard/communiques-de-presse")
        revalidatePath("/presse")
        revalidatePath(
            type === "CDP"
                ? "/presse/communiques-de-presse"
                : "/presse/dossiers-de-presse"
        )

        return {
            success: true
        }
    } else {
        // failed to create the record

        // Remove the file from the storage
        const { error } = await supabase.storage
            .from("communique-de-presse")
            .remove([file])

        if (error) {
            console.error(error.message)
        }

        return {
            error: `Echec de l'ajout du CDP dans la base de données`
        }
    }
}
