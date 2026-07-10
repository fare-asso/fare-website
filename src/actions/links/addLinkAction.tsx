import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddLinkSchema, type TAddLink } from "@/schemas/link"

async function addLinkActionImpl(
    input: TAddLink,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des liens"
        }
    }

    const data = AddLinkSchema(input)
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
        return { success: false, error: "Échec de la création du lien." }
    }
    if (category.value === null) {
        return { success: false, error: "Catégorie introuvable." }
    }

    const created = await tryCatch(
        prisma.linkItem.create({
            data: {
                label: data.label,
                url: data.url,
                categoryId: data.categoryId
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return { success: false, error: "Échec de la création du lien." }
    }

    return { success: true }
}

export const addLinkAction = wrapAction("addLinkAction", addLinkActionImpl)
