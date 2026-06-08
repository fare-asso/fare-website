"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddLinkCategorySchema, type TAddLinkCategory } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

async function addLinkCategoryActionImpl(
    input: TAddLinkCategory
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

    revalidatePath("/dashboard/liens")
    revalidatePath("/liens")
    return { success: true }
}

export default withServerAction(
    "addLinkCategoryAction",
    addLinkCategoryActionImpl
)
