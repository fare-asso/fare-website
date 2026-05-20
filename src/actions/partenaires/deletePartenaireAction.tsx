"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deletePartenaireActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
): Promise<{ success: true } | { success: false; error: string }> {
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

    const partenaire = await prisma.partenaire.findUnique({
        where: {
            id: id
        }
    })

    if (partenaire == null) {
        return {
            success: false,
            error: "Echec de la suppression du partenaire"
        }
    }

    if (partenaire.logoPath.length > 0) {
        const { error } = await supabase.storage
            .from("partner-pictures")
            .remove([partenaire.logoPath])

        if (error) {
            console.error(error.message)
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

    revalidatePath("/dashboard/partenaires")
    revalidatePath("/a-propos/partenaires")

    return { success: true }
}

export default withServerAction(
    "deletePartenaireAction",
    deletePartenaireActionImpl
)
