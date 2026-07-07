import { createServerFn } from "@tanstack/react-start"

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

type Result = { success: true } | { success: false; error: string }

async function deleteLinkCategoryActionImpl(id: number): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des catégories"
        }
    }

    const deleted = await tryCatch(
        prisma.linkCategory.delete({ where: { id } })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de la catégorie"
        }
    }

    return { success: true }
}

const deleteLinkCategoryActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (
            data: ActionPayload<Parameters<typeof deleteLinkCategoryActionImpl>>
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteLinkCategoryAction",
            deleteLinkCategoryActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof deleteLinkCategoryActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof deleteLinkCategoryActionImpl>
): ReturnType<typeof deleteLinkCategoryActionImpl> =>
    deleteLinkCategoryActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteLinkCategoryActionImpl>
