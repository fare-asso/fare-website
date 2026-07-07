import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface MemberOrder {
    id: number
    order: number
}

async function updateMemberOrderActionImpl(memberOrder: MemberOrder[]) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
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

    // Revalidate paths

    return { success: true }
}

const updateMemberOrderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof updateMemberOrderActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateMemberOrderAction",
            updateMemberOrderActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof updateMemberOrderActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof updateMemberOrderActionImpl>
): ReturnType<typeof updateMemberOrderActionImpl> =>
    updateMemberOrderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateMemberOrderActionImpl>
