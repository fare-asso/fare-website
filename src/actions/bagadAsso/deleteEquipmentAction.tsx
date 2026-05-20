"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteEquipmentActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    equipmentId: number
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-equipment")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    // create supabase client
    const supabase = await createClient()

    // fetch association to delete
    const equipment = await prisma.bagadAssoEquipment.findUnique({
        where: {
            id: equipmentId
        }
    })

    if (equipment == null) {
        return { error: "Echec de la suppression de l'équipement" }
    }

    /* Remove pictures from storage if there is some */
    if (equipment.imagePath) {
        const { error } = await supabase.storage
            .from("equipment-pictures")
            .remove([equipment.imagePath])

        if (error) {
            console.log(error.message)
            return {
                error: "Echec de la suppression des images dans la base de données"
            }
        }
    }

    // delete record
    const deleted = await tryCatch(
        prisma.bagadAssoEquipment.delete({
            where: {
                id: equipmentId
            }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { error: "Echec de la suppression de l'équipement" }
    }
    revalidatePath("/dashboard/bagadAsso")
    revalidatePath("/projets/bagad-asso")
    return { success: true }
}

export default withServerAction(
    "deleteEquipmentAction",
    deleteEquipmentActionImpl
)
