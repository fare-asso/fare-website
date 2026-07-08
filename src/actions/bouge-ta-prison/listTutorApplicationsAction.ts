import type { ActionAPIContext } from "astro:actions"

import type { BTPTutorApplication } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchTutorApplications(): Promise<
    BTPTutorApplication[] | null
> {
    const applications = await tryCatch(
        prisma.bTPTutorApplication.findMany({
            orderBy: { createdAt: "desc" }
        })
    )
    if (!applications.success) {
        captureActionError(applications.error)
        return null
    }
    return applications.value
}

async function listTutorApplicationsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: BTPTutorApplication[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

    const applications = await fetchTutorApplications()
    if (!applications) {
        return {
            success: false,
            error: "Échec du chargement des candidatures."
        }
    }
    return { success: true, value: applications }
}

export const listTutorApplicationsAction = wrapAction(
    "listTutorApplicationsAction",
    listTutorApplicationsActionImpl
)
