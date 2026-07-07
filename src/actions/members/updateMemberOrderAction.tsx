import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

interface MemberOrder {
    id: number
    order: number
}

export const updateMemberOrderAction = createServerFn({ method: "POST" })
    .validator((data: MemberOrder[]) => data)
    .handler(
        withServerAction(
            "updateMemberOrderAction",
            async ({ data: memberOrder }) => {
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

                return { success: true }
            }
        )
    )
