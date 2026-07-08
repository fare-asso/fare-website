import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import {
    EditPartenaireSchema,
    type TEditPartenaire
} from "@/app/(public)/a-propos/partenaires/partenaires-schema"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function editPartenaireActionImpl(
    input: TEditPartenaire,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:partner")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des partenaires"
        }
    }

    const data = EditPartenaireSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = createClient(context)

    const current = await tryCatch(
        prisma.partenaire.findUnique({
            where: { id: data.id },
            select: { logoPath: true }
        })
    )
    if (!current.success) {
        captureActionError(current.error)
        return {
            success: false,
            error: "Échec de la récupération du partenaire."
        }
    }

    if (current.value === null) {
        return { success: false, error: "Partenaire introuvable." }
    }

    let logoPath = current.value.logoPath

    if (data.logo) {
        const fileExt = data.logo.name.split(".").pop() ?? "bin"
        const newPath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("partner-pictures")
                .upload(newPath, data.logo, { contentType: data.logo.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload du logo." }
        }
        logoPath = upload.value.path

        if (current.value.logoPath.length > 0) {
            await tryCatch(
                supabase.storage
                    .from("partner-pictures")
                    .remove([current.value.logoPath])
            )
        }
    }

    const updated = await tryCatch(
        prisma.partenaire.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description,
                logoPath
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Échec de la modification du partenaire."
        }
    }

    return { success: true }
}

export const editPartenaireAction = wrapAction(
    "editPartenaireAction",
    editPartenaireActionImpl
)
