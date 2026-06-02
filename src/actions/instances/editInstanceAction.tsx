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
import { EditInstanceSchema, type TEditInstance } from "@/schemas/instance"

type Result = { success: true } | { success: false; error: string }

async function editInstanceActionImpl(input: TEditInstance): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des instances"
        }
    }

    const data = EditInstanceSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = await createClient()

    const current = await tryCatch(
        prisma.instance.findUnique({
            where: { id: data.id },
            select: { logoPath: true }
        })
    )
    if (!current.success) {
        captureActionError(current.error)
        return {
            success: false,
            error: "Échec de la récupération de l'instance."
        }
    }

    if (current.value === null) {
        return { success: false, error: "Instance introuvable." }
    }

    let logoPath = current.value.logoPath

    if (data.logo) {
        const fileExt = data.logo.name.split(".").pop() ?? "bin"
        const newPath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("instance-pictures")
                .upload(newPath, data.logo, { contentType: data.logo.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload du logo." }
        }
        logoPath = upload.value.path

        if (current.value.logoPath && current.value.logoPath.length > 0) {
            const cleanup = await tryCatch(
                supabase.storage
                    .from("instance-pictures")
                    .remove([current.value.logoPath])
            )
            if (!cleanup.success) captureActionError(cleanup.error)
        }
    }

    const updated = await tryCatch(
        prisma.instance.update({
            where: { id: data.id },
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                description: data.description ?? null,
                logoPath
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Échec de la modification de l'instance."
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")
    return { success: true }
}

export default withServerAction("editInstanceAction", editInstanceActionImpl)
