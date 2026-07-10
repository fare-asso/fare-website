import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddLinkCategorySchema, type TAddLinkCategory } from "@/schemas/link"

async function addLinkCategoryActionImpl(
    input: TAddLinkCategory,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des catégories"
        }
    }

    const data = AddLinkCategorySchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const created = await tryCatch(
        prisma.linkCategory.create({
            data: { name: data.name }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Échec de la création de la catégorie."
        }
    }

    return { success: true }
}

export const addLinkCategoryAction = wrapAction(
    "addLinkCategoryAction",
    addLinkCategoryActionImpl
)
