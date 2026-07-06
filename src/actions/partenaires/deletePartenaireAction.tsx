import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeletePartenaireResult =
    | { success: true }
    | { success: false; error: string }

async function deletePartenaireActionImpl(
    id: number
): Promise<DeletePartenaireResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:partner")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des partenaires"
        }
    }

    const supabase = await createClient()

    const partenaire = await tryCatch(
        prisma.partenaire.findUnique({ where: { id } })
    )
    if (!partenaire.success) {
        captureActionError(partenaire.error)
        return {
            success: false,
            error: "Echec de la suppression du partenaire"
        }
    }
    if (partenaire.value === null) {
        return { success: false, error: "Partenaire introuvable." }
    }

    if (partenaire.value.logoPath.length > 0) {
        const removed = await tryCatch(
            supabase.storage
                .from("partner-pictures")
                .remove([partenaire.value.logoPath])
        )
        if (!removed.success) {
            captureActionError(removed.error)
            return {
                success: false,
                error: "Echec de la suppression du logo dans la base de données"
            }
        }
    }

    const deleted = await tryCatch(prisma.partenaire.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression du partenaire"
        }
    }

    return { success: true }
}

const deletePartenaireActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof deletePartenaireActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "deletePartenaireAction",
            deletePartenaireActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof deletePartenaireActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof deletePartenaireActionImpl>
): ReturnType<typeof deletePartenaireActionImpl> =>
    deletePartenaireActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deletePartenaireActionImpl>
