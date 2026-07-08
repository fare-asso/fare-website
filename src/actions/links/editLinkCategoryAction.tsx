import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditLinkCategorySchema, type TEditLinkCategory } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

async function editLinkCategoryActionImpl(
    input: TEditLinkCategory,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des catégories"
        }
    }

    const data = EditLinkCategorySchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const updated = await tryCatch(
        prisma.linkCategory.update({
            where: { id: data.id },
            data: { name: data.name }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Échec de la modification de la catégorie."
        }
    }

    return { success: true }
}

export const editLinkCategoryAction = wrapAction(
    "editLinkCategoryAction",
    editLinkCategoryActionImpl
)
