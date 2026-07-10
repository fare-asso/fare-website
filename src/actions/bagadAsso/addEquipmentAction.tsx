import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import {
    createAdminClient,
    getUserWithPermissions
} from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    AddEquipmentSchema,
    type TAddEquipment
} from "@/schemas/bagadEquipment"

async function addEquipmentActionImpl(
    input: TAddEquipment,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:bagad-equipment")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const data = AddEquipmentSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = createAdminClient()

    // Optional image upload
    let imagePath: string | null = null
    if (data.image) {
        const fileExt = data.image.name.split(".").pop() ?? "bin"
        const filePath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("equipment-pictures")
                .upload(filePath, data.image, { contentType: data.image.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload de l'image." }
        }
        imagePath = upload.value.path
    }

    const created = await tryCatch(
        prisma.bagadAssoEquipment.create({
            data: {
                name: data.name,
                deposit: data.deposit,
                quantity: data.quantity,
                imagePath
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        if (imagePath) {
            await supabase.storage
                .from("equipment-pictures")
                .remove([imagePath])
        }
        return {
            success: false,
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        }
    }

    return { success: true }
}

export const addEquipmentAction = wrapAction(
    "addEquipmentAction",
    addEquipmentActionImpl
)
