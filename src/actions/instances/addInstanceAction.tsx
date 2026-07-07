import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AddInstanceSchema } from "@/schemas/instance"

export const addInstanceAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "addInstance",
            async ({
                data: fd
            }): Promise<
                { success: true } | { success: false; error: string }
            > => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "create:instance")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de créer des instances"
                    }
                }

                const description = fd.get("description")
                const input = {
                    name: fd.get("name"),
                    contactEmail: fd.get("contactEmail"),
                    ...(typeof description === "string" ? { description } : {}),
                    logos: fd.getAll("logos")
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
                                const fileExt =
                                    file.name.split(".").pop() ?? "bin"
                                const filePath = `${crypto.randomUUID()}.${fileExt}`
                                return supabase.storage
                                    .from("instance-pictures")
                                    .upload(filePath, file, {
                                        contentType: file.type
                                    })
                            })
                        )
                    )
                    if (!uploads.success) {
                        captureActionError(uploads.error)
                        return {
                            success: false,
                            error: "Échec de l'upload des logos."
                        }
                    }

                    // tryCatch ne déballe pas un tableau de { data, error }, du coup on inspecte
                    // chaque résultat et nettoie tout si l'un d'eux échoue.
                    const succeeded = uploads.value
                        .map((response) => response.data?.path)
                        .filter((path): path is string => path !== undefined)
                    if (
                        uploads.value.some(
                            (response) => response.error || !response.data
                        )
                    ) {
                        if (succeeded.length > 0) {
                            const cleanup = await tryCatch(
                                supabase.storage
                                    .from("instance-pictures")
                                    .remove(succeeded)
                            )
                            if (!cleanup.success) {
                                cleanup.error.cause = uploads.error
                                captureActionError(cleanup.error)
                            }
                        }
                        return {
                            success: false,
                            error: "Échec de l'upload des logos."
                        }
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
                            supabase.storage
                                .from("instance-pictures")
                                .remove(logoPaths)
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
        )
    )
