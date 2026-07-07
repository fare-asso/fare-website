import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient, createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteAssociationActionImpl(id: number) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:association")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des associations"
        }
    }

    // create supabase client
    const supabase = createClient()

    // create supabase admin client (only on server)
    const supabaseAdmin = createAdminClient()

    // fetch association to delete
    const association = await prisma.association.findUnique({
        where: {
            id: id
        }
    })

    if (association == null) {
        return { error: "Echec de la suppression de l'association" }
    }

    /* Remove representative */
    if (association.representativeId) {
        const removed = await tryCatch(
            supabaseAdmin.auth.admin.deleteUser(association.representativeId)
        )
        if (!removed.success) {
            captureActionError(removed.error)
            return {
                error: "Echec de la suppression du compte représentant"
            }
        }
    }

    /* Remove pictures from storage if there is some */
    if (association.logoPath.length > 0) {
        const { error } = await supabase.storage
            .from("association-pictures")
            .remove([association.logoPath])

        if (error) {
            console.log(error.message)
            return {
                error: "Echec de la suppression des images dans la base de données"
            }
        }
    }

    // delete record
    const deleted = await tryCatch(
        prisma.association.delete({
            where: {
                id: id
            }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { error: "Echec de la suppression de l'association" }
    }
    return { success: true }
}

const deleteAssociationActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof deleteAssociationActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteAssociationAction",
            deleteAssociationActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof deleteAssociationActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof deleteAssociationActionImpl>
): ReturnType<typeof deleteAssociationActionImpl> =>
    deleteAssociationActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteAssociationActionImpl>
