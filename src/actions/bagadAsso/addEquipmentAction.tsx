import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    AddEquipmentSchema,
    type TAddEquipment
} from "@/schemas/bagadEquipment"

async function addEquipmentActionImpl(
    input: TAddEquipment
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getCurrentUserWithPermissions()
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
        const filePath = `${crypto.randomUUID()}.${fileExt}`
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

const addEquipmentActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof addEquipmentActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "addEquipmentAction",
            addEquipmentActionImpl
        )(...unpackActionArgs<Parameters<typeof addEquipmentActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof addEquipmentActionImpl>
): ReturnType<typeof addEquipmentActionImpl> =>
    addEquipmentActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof addEquipmentActionImpl>
