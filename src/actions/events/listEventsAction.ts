import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type EventWithImage = {
    id: number
    name: string
    desc: string
    image: string
    imageUrl: string
    startTime: Date
    endTime: Date
    location: string
    category: { id: number; name: string }
    createdBy: { id: string; name: string | null }
    visibility: boolean
}

export async function fetchEvents(): Promise<EventWithImage[] | null> {
    const storage = new StorageUtils()
    const events = await tryCatch(
        prisma.event.findMany({
            select: {
                id: true,
                name: true,
                desc: true,
                image: true,
                startTime: true,
                endTime: true,
                location: true,
                category: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
                visibility: true
            },
            orderBy: { startTime: "desc" }
        })
    )
    if (!events.success) {
        captureActionError(events.error)
        return null
    }
    return events.value.map((event) => ({
        ...event,
        imageUrl: event.image
            ? storage.from("EventPictures").getPublicUrl(event.image)
            : ""
    }))
}

async function listEventsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<EventWithImage[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:events")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const events = await fetchEvents()
    if (!events) {
        return { success: false, error: "Échec du chargement des évènements." }
    }
    return { success: true, value: events }
}

export const listEventsAction = wrapAction(
    "listEventsAction",
    listEventsActionImpl
)
