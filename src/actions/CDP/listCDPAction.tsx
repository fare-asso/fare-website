import type { ActionAPIContext } from "astro:actions"

import type { CommuniqueDePresse } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type CDPWithUrls = {
    cdp: CommuniqueDePresse
    url: string
    dlUrl: string
}

export async function fetchCDP(): Promise<CDPWithUrls[] | null> {
    const su = new StorageUtils()
    const communiques = await tryCatch(
        prisma.communiqueDePresse.findMany({
            take: 32,
            orderBy: { createdAt: "desc" }
        })
    )
    if (!communiques.success) {
        captureActionError(communiques.error)
        return null
    }
    return communiques.value.map((cdp) => ({
        cdp,
        url: su.from("communique-de-presse").getPublicUrl(cdp.filePath),
        dlUrl: su.from("communique-de-presse").getPublicUrl(cdp.filePath, true)
    }))
}

async function listCDPActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    { success: true; value: CDPWithUrls[] } | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:presse")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const cdp = await fetchCDP()
    if (!cdp) {
        return { success: false, error: "Échec du chargement des communiqués." }
    }
    return { success: true, value: cdp }
}

export const listCDPAction = wrapAction("listCDPAction", listCDPActionImpl)
