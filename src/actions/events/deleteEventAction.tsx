import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteEventActionImpl(
    { eventId }: { eventId: number },
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:event")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // fetch the event's stored image path
    const event = await tryCatch(
        prisma.event.findUnique({
            where: { id: eventId },
            select: { image: true }
        })
    )
    if (!event.success) {
        captureActionError(event.error)
        return {
            success: false,
            error: "Echec de la suppression de l'évènement"
        }
    }

    // remove the image from the storage if there is one
    const imagePath = event.value?.image
    if (imagePath) {
        const res = await supabase.storage
            .from("EventPictures")
            .remove([imagePath])

        if (res.error) {
            captureActionError(res.error)
            return {
                success: false,
                error: "Echec de la suppression de l'image de l'évènement"
            }
        }
    }

    const deleted = await tryCatch(
        prisma.event.delete({
            where: {
                id: eventId
            }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'évènement"
        }
    }

    return { success: true }
}

export const deleteEventAction = wrapAction(
    "deleteEventAction",
    deleteEventActionImpl
)
