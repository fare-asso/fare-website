import type { ActionAPIContext } from "astro:actions"

import type { BagadAssoEquipment } from "@/generated/prisma/client"
import { getNextBookingsByEquipment } from "@/helpers/bagadAsso"
import type { EquipmentNextBooking } from "@/helpers/bagadAsso"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type EquipmentWithDetails = {
    equipment: BagadAssoEquipment
    imageUrl: string | null
    nextBooking: EquipmentNextBooking | null
}

export async function fetchEquipments(): Promise<
    EquipmentWithDetails[] | null
> {
    const storage = new StorageUtils()
    const result = await tryCatch(
        Promise.all([
            prisma.bagadAssoEquipment.findMany({ orderBy: { name: "asc" } }),
            getNextBookingsByEquipment()
        ])
    )
    if (!result.success) {
        captureActionError(result.error)
        return null
    }
    const [equipments, nextBookings] = result.value
    return equipments.map((equipment) => ({
        equipment,
        imageUrl: equipment.imagePath
            ? storage
                  .from("equipment-pictures")
                  .getPublicUrl(equipment.imagePath)
            : null,
        nextBooking: nextBookings.get(equipment.id) ?? null
    }))
}

async function listEquipmentsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: EquipmentWithDetails[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:bagad-asso")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const equipments = await fetchEquipments()
    if (!equipments) {
        return { success: false, error: "Échec du chargement du matériel." }
    }
    return { success: true, value: equipments }
}

export const listEquipmentsAction = wrapAction(
    "listEquipmentsAction",
    listEquipmentsActionImpl
)
