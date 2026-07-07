import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

    return { success: true }
}

const editLinkCategoryActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof editLinkCategoryActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "editLinkCategoryAction",
            editLinkCategoryActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof editLinkCategoryActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof editLinkCategoryActionImpl>
): ReturnType<typeof editLinkCategoryActionImpl> =>
    editLinkCategoryActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof editLinkCategoryActionImpl>
