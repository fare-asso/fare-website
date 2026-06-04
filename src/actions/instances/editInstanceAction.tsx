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
            select: { logoPaths: true }
        })
    )
    if (!current.success) {
        captureActionError(
            new Error("Echec de la récupération de l'instance", {
                cause: current.error
            })
        )
        return {
            success: false,
            error: "Échec de la récupération de l'instance."
        }
    }

    if (current.value === null) {
        return { success: false, error: "Instance introuvable." }
    }

    let logoPaths = current.value.logoPaths

    if (data.logos && data.logos.length > 0) {
        const uploads = await tryCatch(
            Promise.all(
                data.logos.map((file) => {
                    const fileExt = file.name.split(".").pop() ?? "bin"
                    const newPath = `${randomUUID()}.${fileExt}`
                    return supabase.storage
                        .from("instance-pictures")
                        .upload(newPath, file, { contentType: file.type })
                })
            )
        )
        if (!uploads.success) {
            captureActionError(
                new Error("Echec de l'upload des logos", {
                    cause: uploads.error
                })
            )
            return { success: false, error: "Échec de l'upload des logos." }
        }

        // tryCatch ne déballe pas un tableau de { data, error } : inspecter
        // chaque résultat et nettoyer les uploads réussis si l'un d'eux échoue.
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
                if (!cleanup.success)
                    captureActionError(
                        new Error("Echec du nettoyage des logos partiels", {
                            cause: cleanup.error
                        })
                    )
            }
            return { success: false, error: "Échec de l'upload des logos." }
        }

        // Remplacement : supprimer l'ancien set uniquement après succès complet
        if (current.value.logoPaths.length > 0) {
            const cleanup = await tryCatch(
                supabase.storage
                    .from("instance-pictures")
                    .remove(current.value.logoPaths)
            )
            if (!cleanup.success)
                captureActionError(
                    new Error("Echec de la suppression des anciens logos", {
                        cause: cleanup.error
                    })
                )
        }
        logoPaths = succeeded
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
        captureActionError(
            new Error("Echec de la modification de l'instance", {
                cause: updated.error
            })
        )
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
