import { createServerFn } from "@tanstack/react-start"

import type { PresseType } from "@/generated/prisma/client"
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

async function createCDPActionImpl(formData: FormData) {
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
    const supabase = createClient()

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
    const created = await tryCatch(
        prisma.communiqueDePresse.create({
            data: {
                name: name,
                filePath: file,
                size: fileSize,
                createdAt: date ? new Date(date) : new Date(),
                type: type
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        const { error: removeError } = await supabase.storage
            .from("communique-de-presse")
            .remove([file])
        if (removeError) {
            console.error(removeError.message)
        }
        return {
            error: `Echec de l'ajout du CDP dans la base de données`
        }
    }
    const createdCDP = created.value

    if (createdCDP == null) {
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

    return {
        success: true
    }
}

const createCDPActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof createCDPActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction("createCDPAction", createCDPActionImpl, {
            attachFormData: true
        })(...unpackActionArgs<Parameters<typeof createCDPActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof createCDPActionImpl>
): ReturnType<typeof createCDPActionImpl> =>
    createCDPActionServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof createCDPActionImpl
    >
