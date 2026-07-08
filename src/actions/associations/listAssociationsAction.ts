import type { ActionAPIContext } from "astro:actions"

import type { Association } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type AssociationWithLogo = {
    association: Association
    logoUrl: string
}

export async function fetchAssociations(): Promise<
    AssociationWithLogo[] | null
> {
    const storage = new StorageUtils()
    const associations = await tryCatch(
        prisma.association.findMany({ orderBy: { name: "asc" } })
    )
    if (!associations.success) {
        captureActionError(associations.error)
        return null
    }
    const sorted = [...associations.value].sort((a, b) => {
        // Pending (approved === null) first, then alphabetical by name
        if (a.approved === null && b.approved !== null) return -1
        if (a.approved !== null && b.approved === null) return 1
        return 0
    })
    return sorted.map((association) => ({
        association,
        logoUrl: storage
            .from("association-pictures")
            .getPublicUrl(association.logoPath)
    }))
}

async function listAssociationsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: AssociationWithLogo[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

    const associations = await fetchAssociations()
    if (!associations) {
        return {
            success: false,
            error: "Échec du chargement des associations."
        }
    }
    return { success: true, value: associations }
}

export const listAssociationsAction = wrapAction(
    "listAssociationsAction",
    listAssociationsActionImpl
)
