import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditInstanceSchema } from "@/schemas/instance"

type Result = { success: true } | { success: false; error: string }

export const editInstanceAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "editInstance",
            async ({ data: fd }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:instance")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier des instances"
                    }
                }

                const description = fd.get("description")
                const input = {
                    id: Number(fd.get("id")),
                    name: fd.get("name"),
                    contactEmail: fd.get("contactEmail"),
                    ...(typeof description === "string" ? { description } : {}),
                    logos: fd.getAll("logos")
                }

                const data = EditInstanceSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const supabase = createClient()

                const current = await tryCatch(
                    prisma.instance.findUnique({
                        where: { id: data.id },
                        select: { logoPaths: true }
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

                const oldLogoPaths = current.value.logoPaths
                let logoPaths = oldLogoPaths
                let uploadedNew = false

                if (data.logos && data.logos.length > 0) {
                    const uploads = await tryCatch(
                        Promise.all(
                            data.logos.map((file) => {
                                const fileExt =
                                    file.name.split(".").pop() ?? "bin"
                                const newPath = `${crypto.randomUUID()}.${fileExt}`
                                return supabase.storage
                                    .from("instance-pictures")
                                    .upload(newPath, file, {
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

                    // tryCatch ne déballe pas un tableau de { data, error } : inspecter
                    // chaque résultat et nettoyer les uploads réussis si l'un d'eux échoue.
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
                            if (!cleanup.success)
                                captureActionError(
                                    new Error(
                                        "Echec du nettoyage des logos partiels",
                                        { cause: cleanup.error }
                                    )
                                )
                        }
                        return {
                            success: false,
                            error: "Échec de l'upload des logos."
                        }
                    }

                    logoPaths = succeeded
                    uploadedNew = true
                }

                const updated = await tryCatch(
                    prisma.instance.update({
                        where: { id: data.id },
                        data: {
                            name: data.name,
                            contactEmail: data.contactEmail,
                            description: data.description ?? null,
                            logoPaths
                        }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    // Nettoyer les nouveaux logos orphelins, conserver l'ancien set intact
                    if (uploadedNew && logoPaths.length > 0) {
                        const cleanup = await tryCatch(
                            supabase.storage
                                .from("instance-pictures")
                                .remove(logoPaths)
                        )
                        if (!cleanup.success)
                            captureActionError(
                                new Error(
                                    "Echec du nettoyage des nouveaux logos",
                                    { cause: cleanup.error }
                                )
                            )
                    }
                    return {
                        success: false,
                        error: "Échec de la modification de l'instance."
                    }
                }

                // Remplacement : supprimer l'ancien set uniquement après le succès du update
                if (uploadedNew && oldLogoPaths.length > 0) {
                    const cleanup = await tryCatch(
                        supabase.storage
                            .from("instance-pictures")
                            .remove(oldLogoPaths)
                    )
                    if (!cleanup.success)
                        captureActionError(
                            new Error(
                                "Echec de la suppression des anciens logos",
                                { cause: cleanup.error }
                            )
                        )
                }

                return { success: true }
            }
        )
    )
