"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditLinkCategorySchema, type TEditLinkCategory } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

async function editLinkCategoryActionImpl(
    input: TEditLinkCategory
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

    revalidatePath("/dashboard/liens")
    revalidatePath("/liens")
    return { success: true }
}

export default withServerAction(
    "editLinkCategoryAction",
    editLinkCategoryActionImpl
)
