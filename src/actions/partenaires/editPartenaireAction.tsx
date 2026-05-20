"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import {
    EditPartenaireSchema,
    type TEditPartenaire
} from "@/app/(public)/a-propos/partenaires/partenaires-schema"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function editPartenaireActionImpl(
    input: TEditPartenaire
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

    const supabase = await createClient()

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
        const upload = await tryCatch(
            supabase.storage
                .from("partner-pictures")
                .update(current.value.logoPath, data.logo)
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload du logo." }
        }
        logoPath = upload.value.path
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

    revalidatePath("/dashboard/partenaires")
    revalidatePath("/a-propos/partenaires")
    return { success: true }
}

export default withServerAction(
    "editPartenaireAction",
    editPartenaireActionImpl
)
