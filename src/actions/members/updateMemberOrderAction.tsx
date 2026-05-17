"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
        // Update all members' order in a transaction
        await prisma.$transaction(
            memberOrder.map((item) =>
                prisma.member.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        // Revalidate paths
        revalidatePath("/dashboard/membres")
        revalidatePath("/a-propos/bureau")

        return { success: true }
    } catch (error) {
        captureActionError(error)
        return {
            error: "La mise à jour de l'ordre des membres a échoué. Veuillez réessayer."
        }
    }
}

export default withServerAction(
    "updateMemberOrderAction",
    updateMemberOrderActionImpl
)
