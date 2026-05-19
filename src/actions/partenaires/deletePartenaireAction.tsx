"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient, createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function deletePartenaireActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:partner")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des partenaires"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // create supabase admin client (only on server)
    const supabaseAdmin = await createAdminClient()

    // fetch association to delete
    const partenaire = await prisma.partenaire.findUnique({
        where: {
            id: id
        }
    })

    if (partenaire == null) {
        return { error: "Echec de la suppression du partenaire" }
    }

    if (partenaire.logoPath.length > 0) {
        const { error } = await supabase.storage
            .from("partner-pictures")
            .remove([partenaire.logoPath])

        if (error) {
            console.error(error.message)
            return {
                error: "Echec de la suppression du logo dans la base de données"
            }
        }
    }

    try {
        const _deleteRecord = await prisma.partenaire.delete({ where: { id } })
        revalidatePath("/dashboard/partenaires")
        revalidatePath("/a-propos/partenaires")
    } catch (error) {
        captureActionError(error)
        return {
            error: "Echec de la suppression du partenaire"
        }
    }
}

export default withServerAction(
    "deletePartenaireAction",
    deletePartenaireActionImpl
)
