import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditConseilSchema, type TEditConseil } from "@/schemas/conseil"

type Result = { success: true } | { success: false; error: string }

async function editConseilActionImpl(input: TEditConseil): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

const editConseilActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof editConseilActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "editConseilAction",
            editConseilActionImpl
        )(...unpackActionArgs<Parameters<typeof editConseilActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof editConseilActionImpl>
): ReturnType<typeof editConseilActionImpl> =>
    editConseilActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof editConseilActionImpl>
