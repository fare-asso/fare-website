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
import { EditLinkSchema, type TEditLink } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

async function editLinkActionImpl(input: TEditLink): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

const editLinkActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof editLinkActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "editLinkAction",
            editLinkActionImpl
        )(...unpackActionArgs<Parameters<typeof editLinkActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof editLinkActionImpl>
): ReturnType<typeof editLinkActionImpl> =>
    editLinkActionServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof editLinkActionImpl
    >
