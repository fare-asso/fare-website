import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditConseilSchema, type TEditConseil } from "@/schemas/conseil"

async function editConseilActionImpl(
    input: TEditConseil,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des conseils"
        }
    }

    const data = EditConseilSchema(input)
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
            error: "Échec de la modification du conseil."
        }
    }
    if (instance.value === null) {
        return { success: false, error: "Instance introuvable." }
    }

    const updated = await tryCatch(
        prisma.conseil.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description ?? null,
                instanceId: data.instanceId
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Échec de la modification du conseil."
        }
    }

    return { success: true }
}

export const editConseilAction = wrapAction(
    "editConseilAction",
    editConseilActionImpl
)
