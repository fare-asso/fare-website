import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import {
    createAdminClient,
    createClient,
    getUserWithPermissions
} from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteAssociationActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:association")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des associations"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // create supabase admin client (only on server)
    const supabaseAdmin = createAdminClient()

    // fetch association to delete
    const association = await prisma.association.findUnique({
        where: {
            id: id
        }
    })

    if (association == null) {
        return {
            success: false,
            error: "Echec de la suppression de l'association"
        }
    }

    /* Remove representative */
    if (association.representativeId) {
        const removed = await tryCatch(
            supabaseAdmin.auth.admin.deleteUser(association.representativeId)
        )
        if (!removed.success) {
            captureActionError(removed.error)
            return {
                success: false,
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
                success: false,
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
        return {
            success: false,
            error: "Echec de la suppression de l'association"
        }
    }
    return { success: true }
}

export const deleteAssociationAction = wrapAction(
    "deleteAssociationAction",
    deleteAssociationActionImpl
)
