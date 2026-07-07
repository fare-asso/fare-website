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

async function deleteCDPActionImpl({ id }: { id: number }) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:cdp")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des communiqués de presse"
        }
    }

    // create supabase client
    const supabase = createClient()

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

        // revalidate Path
        return {
            success: true
        }
    }
}

const deleteCDPActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof deleteCDPActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteCDPAction",
            deleteCDPActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteCDPActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteCDPActionImpl>
): ReturnType<typeof deleteCDPActionImpl> =>
    deleteCDPActionServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof deleteCDPActionImpl
    >
