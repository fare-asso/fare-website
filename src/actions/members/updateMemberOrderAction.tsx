import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface MemberOrder {
    id: number
    order: number
}

async function updateMemberOrderActionImpl(
    memberOrder: MemberOrder[],
    context: ActionAPIContext
) {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:member")) {
        return {
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
            error: "La mise à jour de l'ordre des membres a échoué. Veuillez réessayer."
        }
    }

    return { success: true }
}

export const updateMemberOrderAction = wrapAction(
    "updateMemberOrderAction",
    updateMemberOrderActionImpl
)
