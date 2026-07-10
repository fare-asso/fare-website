import type { ActionAPIContext } from "astro:actions"

import type { PresseType } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import {
    createAdminClient,
    getUserWithPermissions
} from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 25

function isPresseType(value: string): value is PresseType {
    return value === "CDP" || value === "DDP"
}

async function createCDPActionImpl(
    formData: FormData,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:cdp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des communiqués de presse"
        }
    }

    const name = formData.get("name")?.toString()
    const file = formData.get("CDPfile")
    const date = formData.get("date")?.toString()
    const typeValue = formData.get("CDPType")?.toString()

    if (
        !name ||
        !typeValue ||
        !isPresseType(typeValue) ||
        !(file instanceof File)
    ) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    if (file.type !== "application/pdf") {
        return { success: false, error: "Le fichier doit être de format PDF" }
    }
    if (file.size === 0 || file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
        return {
            success: false,
            error: `La taille du fichier doit être inférieure à ${MAX_FILE_SIZE_MB}mo`
        }
    }

    const supabase = createAdminClient()
    const filePath = `${sanitizeString(name)}.pdf`

    const uploaded = await tryCatch(
        supabase.storage.from("communique-de-presse").upload(filePath, file)
    )
    if (!uploaded.success) {
        captureActionError(uploaded.error)
        return { success: false, error: "Echec de l'envoi du fichier" }
    }
    const path = uploaded.value.path

    const created = await tryCatch(
        prisma.communiqueDePresse.create({
            data: {
                name,
                filePath: path,
                size: file.size,
                createdAt: date ? new Date(date) : new Date(),
                type: typeValue
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        await supabase.storage.from("communique-de-presse").remove([path])
        return {
            success: false,
            error: "Echec de l'ajout du CDP dans la base de données"
        }
    }

    return { success: true }
}

export const createCDPAction = wrapAction(
    "createCDPAction",
    createCDPActionImpl
)
