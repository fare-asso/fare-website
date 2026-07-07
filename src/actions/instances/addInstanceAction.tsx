import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

    const supabase = createClient()

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

const addInstanceActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof addInstanceActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "addInstanceAction",
            addInstanceActionImpl
        )(...unpackActionArgs<Parameters<typeof addInstanceActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof addInstanceActionImpl>
): ReturnType<typeof addInstanceActionImpl> =>
    addInstanceActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof addInstanceActionImpl>
