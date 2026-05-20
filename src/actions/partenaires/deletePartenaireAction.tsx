"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient, createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deletePartenaireActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
) {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:partner")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des partenaires"
        }
    }

    const supabase = await createClient()

    const _supabaseAdmin = await createAdminClient()

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

    const deleted = await tryCatch(prisma.partenaire.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            error: "Echec de la suppression du partenaire"
        }
    }

    revalidatePath("/dashboard/partenaires")
    revalidatePath("/a-propos/partenaires")
}

export default withServerAction(
    "deletePartenaireAction",
    deletePartenaireActionImpl
)
