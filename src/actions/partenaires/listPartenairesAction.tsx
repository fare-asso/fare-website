import type { ActionAPIContext } from "astro:actions"

import type { Partenaire } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type PartenaireWithLogo = {
    partenaire: Partenaire
    logoUrl: string
}

export async function fetchPartenaires(): Promise<PartenaireWithLogo[] | null> {
    const storage = new StorageUtils()
    const partenaires = await tryCatch(
        prisma.partenaire.findMany({ orderBy: { name: "asc" } })
    )
    if (!partenaires.success) {
        captureActionError(partenaires.error)
        return null
    }
    return partenaires.value.map((partenaire) => ({
        partenaire,
        logoUrl: storage
            .from("partner-pictures")
            .getPublicUrl(partenaire.logoPath)
    }))
}

async function listPartenairesActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<PartenaireWithLogo[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:partner")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const partenaires = await fetchPartenaires()
    if (!partenaires) {
        return {
            success: false,
            error: "Échec du chargement des partenaires."
        }
    }
    return { success: true, value: partenaires }
}

export const listPartenairesAction = wrapAction(
    "listPartenairesAction",
    listPartenairesActionImpl
)
