import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddInstanceSchema, type TAddInstance } from "@/schemas/instance"

async function addInstanceActionImpl(
    input: TAddInstance,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
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

    const supabase = createClient(context)

    const logoPaths: string[] = []
    if (data.logos && data.logos.length > 0) {
        const uploads = await tryCatch(
            Promise.all(
                data.logos.map((file) => {
                    const fileExt = file.name.split(".").pop() ?? "bin"
                    const filePath = `${randomUUID()}.${fileExt}`
                    return supabase.storage
                        .from("instance-pictures")
                        .upload(filePath, file, { contentType: file.type })
                })
            )
        )
        if (!uploads.success) {
            captureActionError(uploads.error)
            return { success: false, error: "Échec de l'upload des logos." }
        }

        // tryCatch ne déballe pas un tableau de { data, error }, du coup on inspecte
        // chaque résultat et nettoie tout si l'un d'eux échoue.
        const succeeded = uploads.value
            .map((response) => response.data?.path)
            .filter((path): path is string => path !== undefined)
        if (
            uploads.value.some((response) => response.error || !response.data)
        ) {
            if (succeeded.length > 0) {
                const cleanup = await tryCatch(
                    supabase.storage.from("instance-pictures").remove(succeeded)
                )
                if (!cleanup.success) {
                    cleanup.error.cause = uploads.error
                    captureActionError(cleanup.error)
                }
            }
            return { success: false, error: "Échec de l'upload des logos." }
        }
        logoPaths.push(...succeeded)
    }

    const created = await tryCatch(
        prisma.instance.create({
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                description: data.description ?? null,
                logoPaths
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        if (logoPaths.length > 0) {
            const cleanup = await tryCatch(
                supabase.storage.from("instance-pictures").remove(logoPaths)
            )
            if (!cleanup.success) {
                cleanup.error.cause = created.error
                captureActionError(cleanup.error)
            }
        }
        return {
            success: false,
            error: "Échec de la création de l'instance."
        }
    }

    return { success: true }
}

export const addInstanceAction = wrapAction(
    "addInstanceAction",
    addInstanceActionImpl
)
