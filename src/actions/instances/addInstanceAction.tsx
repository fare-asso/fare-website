"use server"

import { randomUUID } from "node:crypto"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddInstanceSchema, type TAddInstance } from "@/schemas/instance"

async function addInstanceActionImpl(
    input: TAddInstance
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des instances"
        }
    }

    const data = AddInstanceSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = await createClient()

    let logoPath: string | null = null
    if (data.logo) {
        const fileExt = data.logo.name.split(".").pop() ?? "bin"
        const filePath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("instance-pictures")
                .upload(filePath, data.logo, { contentType: data.logo.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload du logo." }
        }
        logoPath = upload.value.path
    }

    const created = await tryCatch(
        prisma.instance.create({
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                description: data.description ?? null,
                logoPath
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        if (logoPath) {
            await supabase.storage.from("instance-pictures").remove([logoPath])
        }
        return {
            success: false,
            error: "Échec de la création de l'instance."
        }
    }

    revalidatePath("/dashboard/elus/instances")
    return { success: true }
}

export default withServerAction("addInstanceAction", addInstanceActionImpl)
