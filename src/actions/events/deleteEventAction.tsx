import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteEventActionImpl(
    { eventId }: { eventId: number },
    context: ActionAPIContext
) {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:event")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // fetch event Image url
    const imageUrl = await prisma.event.findUnique({
        where: {
            id: eventId
        },
        select: {
            image: true
        }
    })

    // check imageUrl validity and remove it from the storage
    if (imageUrl != null && typeof imageUrl === "string") {
        if (imageUrl === "") {
            // no url
            console.log("No image to remove")
        } else {
            // remove image from the storage
            const res = await supabase.storage
                .from("EventPictures")
                .remove(imageUrl)

            if (res.error) {
                console.error("Failed to delete Url")
                return
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
        return
    }
}

export const deleteEventAction = wrapAction(
    "deleteEventAction",
    deleteEventActionImpl
)
