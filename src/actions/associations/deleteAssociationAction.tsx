"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient, createClient } from "@/helpers/supabase/server"

export default async function deleteAssociationAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    id: number
) {
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
    const supabase = await createClient()

    // create supabase admin client (only on server)
    const supabaseAdmin = await createAdminClient()

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
        try {
            const _removedRepresentative =
                await supabaseAdmin.auth.admin.deleteUser(
                    association.representativeId
                )
        } catch (error) {
            console.error(error)
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
    try {
        const _deletedRecord = await prisma.association.delete({
            where: {
                id: id
            }
        })
        revalidatePath("/dashboard/associations")
        revalidatePath("/reseau")
        revalidatePath("/(home)")
        return { success: true }
    } catch (_) {
        return {
            error: "Echec de la suppression de l'association"
        }
    }
}
