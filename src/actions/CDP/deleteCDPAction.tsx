"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

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
    const supabase = await createClient()

    // Delete Record from DB
    let deletedCdpRecord: Awaited<
        ReturnType<typeof prisma.communiqueDePresse.delete>
    >
    try {
        deletedCdpRecord = await prisma.communiqueDePresse.delete({
            where: {
                id: id
            }
        })
    } catch (error) {
        captureActionError(error)
        return {
            error: "Echec de la suppression du communiqué de presse"
        }
    }

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
        revalidatePath("/dashboard/communiques-de-presse")
        revalidatePath("/presse")
        revalidatePath("/presse/communiques-de-presse")
        revalidatePath("/presse/dossiers-de-presse")
        return {
            success: true
        }
    }
}

export default withServerAction("deleteCDPAction", deleteCDPActionImpl)
