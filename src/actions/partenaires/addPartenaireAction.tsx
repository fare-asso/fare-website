import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import {
    AddPartenaireSchema,
    type TAddPartenaire
} from "@/app/(public)/a-propos/partenaires/partenaires-schema"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import {
    createAdminClient,
    getUserWithPermissions
} from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function addPartenaireActionImpl(
    input: TAddPartenaire,
    context: ActionAPIContext
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:partner")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des partenaires"
        }
    }

    const data = AddPartenaireSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = createAdminClient()
    const fileExt = data.logo.name.split(".").pop() ?? "bin"
    const filePath = `${randomUUID()}.${fileExt}`
    const upload = await tryCatch(
        supabase.storage
            .from("partner-pictures")
            .upload(filePath, data.logo, { contentType: data.logo.type })
    )
    if (!upload.success) {
        captureActionError(upload.error)
        return { success: false, error: "Échec de l'upload du logo." }
    }
    const logoPath = upload.value.path

    const created = await tryCatch(
        prisma.partenaire.create({
            data: {
                name: data.name,
                description: data.description,
                logoPath
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        await supabase.storage.from("partner-pictures").remove([logoPath])
        return {
            success: false,
            error: "Échec de la création du partenaire."
        }
    }

    return { success: true }
}

export const addPartenaireAction = wrapAction(
    "addPartenaireAction",
    addPartenaireActionImpl
)
