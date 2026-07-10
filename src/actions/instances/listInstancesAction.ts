import type { ActionAPIContext } from "astro:actions"

import type { Instance } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type InstanceWithLogo = {
    instance: Instance & { _count: { conseils: number } }
    logoUrls: string[]
}

export async function fetchInstances(): Promise<InstanceWithLogo[] | null> {
    const storage = new StorageUtils()
    const instances = await tryCatch(
        prisma.instance.findMany({
            include: { _count: { select: { conseils: true } } },
            orderBy: { order: "asc" }
        })
    )
    if (!instances.success) {
        captureActionError(instances.error)
        return null
    }
    return instances.value.map((instance) => ({
        instance,
        logoUrls: instance.logoPaths.map((path) =>
            storage.from("instance-pictures").getPublicUrl(path)
        )
    }))
}

async function listInstancesActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<InstanceWithLogo[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:elus")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const instances = await fetchInstances()
    if (!instances) {
        return { success: false, error: "Échec du chargement des instances." }
    }
    return { success: true, value: instances }
}

export const listInstancesAction = wrapAction(
    "listInstancesAction",
    listInstancesActionImpl
)
