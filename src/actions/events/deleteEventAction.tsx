import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteEventAction = createServerFn({ method: "POST" })
    .validator((data: { eventId: number }) => data)
    .handler(
        withServerAction("deleteEvent", async ({ data: { eventId } }) => {
            // Auth and permission verifications
            const user = await getCurrentUserWithPermissions()
            if (!user) {
                return { error: "Authentification requise" }
            }
            if (!hasPermission(user, "delete:event")) {
                return {
                    error: "Vous n'avez pas la permission d'effectuer cette opération"
                }
            }

            // create supabase client
            const supabase = createClient()

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
        })
    )
