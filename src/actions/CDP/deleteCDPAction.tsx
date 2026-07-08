import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteCDPActionImpl(
    { id }: { id: number },
    context: ActionAPIContext
) {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:cdp")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des communiqués de presse"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // Delete Record from DB
    const deleted = await tryCatch(
        prisma.communiqueDePresse.delete({
            where: {
                id: id
            }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            error: "Echec de la suppression du communiqué de presse"
        }
    }
    const deletedCdpRecord = deleted.value

    if (deletedCdpRecord == null) {
        return {
            error: "Echec de la suppression du communiqué de presse"
        }
    }

    // remove file from storage
    const { error: err } = await supabase.storage
        .from("communique-de-presse")
        .remove([deletedCdpRecord.filePath])

    if (err) {
        console.error(err.message)
        return {
            error: "Echec de la suppression du communiqué de presse dans le stockage"
        }
    } else {
        // success
        return {
            success: true
        }
    }
}

export const deleteCDPAction = wrapAction(
    "deleteCDPAction",
    deleteCDPActionImpl
)
