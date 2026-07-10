import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditLinkSchema, type TEditLink } from "@/schemas/link"

async function editLinkActionImpl(
    input: TEditLink,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des liens"
        }
    }

    const data = EditLinkSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const category = await tryCatch(
        prisma.linkCategory.findUnique({
            where: { id: data.categoryId },
            select: { id: true }
        })
    )
    if (!category.success) {
        captureActionError(category.error)
        return { success: false, error: "Échec de la modification du lien." }
    }
    if (category.value === null) {
        return { success: false, error: "Catégorie introuvable." }
    }

    const updated = await tryCatch(
        prisma.linkItem.update({
            where: { id: data.id },
            data: {
                label: data.label,
                url: data.url,
                categoryId: data.categoryId
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return { success: false, error: "Échec de la modification du lien." }
    }

    return { success: true }
}

export const editLinkAction = wrapAction("editLinkAction", editLinkActionImpl)
