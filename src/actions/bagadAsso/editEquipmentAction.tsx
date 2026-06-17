"use server"

import { randomUUID } from "node:crypto"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    EditEquipmentSchema,
    type TEditEquipment
} from "@/schemas/bagadEquipment"

type Result = { success: true } | { success: false; error: string }

async function editEquipmentActionImpl(input: TEditEquipment): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:bagad-equipment")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const data = EditEquipmentSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const current = await tryCatch(
        prisma.bagadAssoEquipment.findUnique({
            where: { id: data.id },
            select: { imagePath: true }
        })
    )
    if (!current.success) {
        captureActionError(current.error)
        return {
            success: false,
            error: "Échec de la récupération de l'équipement."
        }
    }
    if (current.value === null) {
        return { success: false, error: "Équipement non trouvé." }
    }

    const supabase = createAdminClient()
    const oldImagePath = current.value.imagePath
    let imagePath = oldImagePath
    // Track a fresh upload so we can roll it back if the DB write fails.
    let uploadedPath: string | null = null

    if (data.image) {
        const fileExt = data.image.name.split(".").pop() ?? "bin"
        const newPath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("equipment-pictures")
                .upload(newPath, data.image, { contentType: data.image.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload de l'image." }
        }
        imagePath = upload.value.path
        uploadedPath = upload.value.path
    } else if (data.removeImage) {
        imagePath = null
    }

    const updated = await tryCatch(
        prisma.bagadAssoEquipment.update({
            where: { id: data.id },
            data: {
                name: data.name,
                deposit: data.deposit,
                quantity: data.quantity,
                imagePath
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        // Roll back the orphaned upload; leave the existing image intact.
        if (uploadedPath) {
            await tryCatch(
                supabase.storage
                    .from("equipment-pictures")
                    .remove([uploadedPath])
            )
        }
        return {
            success: false,
            error: "Echec de la modification de l'équipement. Veuillez réessayer."
        }
    }

    // The write succeeded — drop the previous image if it is no longer used.
    if (oldImagePath && oldImagePath !== imagePath) {
        await tryCatch(
            supabase.storage.from("equipment-pictures").remove([oldImagePath])
        )
    }

    revalidatePath("/dashboard/bagadAsso")
    revalidatePath("/projets/bagad-asso")
    return { success: true }
}

export default withServerAction("editEquipmentAction", editEquipmentActionImpl)
