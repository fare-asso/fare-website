import type { ActionAPIContext } from "astro:actions"

import type { Conseil, Elu, Instance } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type InstanceTree = Instance & {
    conseils: (Conseil & { elus: Elu[] })[]
}

export async function fetchElus(): Promise<InstanceTree[] | null> {
    const instances = await tryCatch(
        prisma.instance.findMany({
            include: {
                conseils: {
                    orderBy: { order: "asc" },
                    include: {
                        elus: {
                            where: { deletedAt: null },
                            orderBy: { order: "asc" }
                        }
                    }
                }
            },
            orderBy: { order: "asc" }
        })
    )
    if (!instances.success) {
        captureActionError(instances.error)
        return null
    }
    return instances.value
}

async function listElusActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    { success: true; value: InstanceTree[] } | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:elus")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const instances = await fetchElus()
    if (!instances) {
        return { success: false, error: "Échec du chargement des élu·e·s." }
    }
    return { success: true, value: instances }
}

export const listElusAction = wrapAction("listElusAction", listElusActionImpl)
