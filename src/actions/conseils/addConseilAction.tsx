"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddConseilSchema, type TAddConseil } from "@/schemas/conseil"

type Result = { success: true } | { success: false; error: string }

async function addConseilActionImpl(input: TAddConseil): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des conseils"
        }
    }

    const data = AddConseilSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const instance = await tryCatch(
        prisma.instance.findUnique({
            where: { id: data.instanceId },
            select: { id: true }
        })
    )
    if (!instance.success) {
        captureActionError(instance.error)
        return {
            success: false,
            error: "Échec de la création du conseil."
        }
    }
    if (instance.value === null) {
        return { success: false, error: "Instance introuvable." }
    }

    const created = await tryCatch(
        prisma.conseil.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                instanceId: data.instanceId
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Échec de la création du conseil."
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")
    return { success: true }
}

export default withServerAction("addConseilAction", addConseilActionImpl)
