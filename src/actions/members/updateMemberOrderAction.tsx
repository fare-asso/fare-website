import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface MemberOrder {
    id: number
    order: number
}

async function updateMemberOrderActionImpl(
    memberOrder: MemberOrder[],
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:member")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des membres"
        }
    }

    // Update all members' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            memberOrder.map((item) =>
                prisma.member.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "La mise à jour de l'ordre des membres a échoué. Veuillez réessayer."
        }
    }

    return { success: true }
}

export const updateMemberOrderAction = wrapAction(
    "updateMemberOrderAction",
    updateMemberOrderActionImpl
)
