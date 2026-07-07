import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddLinkSchema, type TAddLink } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

async function addLinkActionImpl(input: TAddLink): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

const addLinkActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof addLinkActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "addLinkAction",
            addLinkActionImpl
        )(...unpackActionArgs<Parameters<typeof addLinkActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof addLinkActionImpl>
): ReturnType<typeof addLinkActionImpl> =>
    addLinkActionServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof addLinkActionImpl
    >
