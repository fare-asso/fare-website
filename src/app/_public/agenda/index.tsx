import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import EventArchive from "@/components/public/events/archive"
import CurrentEvents from "@/components/public/events/currentEvents"
import SoonEvents from "@/components/public/events/soon"
import prisma from "@/helpers/db.server"
import { createClient } from "@/helpers/supabase.server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getCurrentEvents = createServerFn().handler(async () => {
    const now = new Date()
    const result = await tryCatch(
        prisma.event.findMany({
            where: {
                AND: {
                    startTime: {
                        lte: now
                    },
                    endTime: {
                        gte: now
                    }
                }
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })
    )
    if (!result.success) return []
    const supabase = createClient()
    return result.value.map((event) => ({
        ...event,
        imageUrl: supabase.storage
            .from("EventPictures")
            .getPublicUrl(event.image).data.publicUrl
    }))
})

const getSoonEvents = createServerFn().handler(async () => {
    const now = new Date()
    const result = await tryCatch(
        prisma.event.findMany({
            where: {
                startTime: {
                    gt: now
                }
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })
    )
    if (!result.success) return []
    const supabase = createClient()
    return result.value.map((event) => ({
        ...event,
        imageUrl: supabase.storage
            .from("EventPictures")
            .getPublicUrl(event.image).data.publicUrl
    }))
})

const getArchivedEvents = createServerFn().handler(async () => {
    const now = new Date()
    const result = await tryCatch(
        prisma.event.findMany({
            where: {
                endTime: {
                    lt: now
                }
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })
    )
    if (!result.success) return []
    const supabase = createClient()
    return result.value.map((event) => ({
        ...event,
        imageUrl: supabase.storage
            .from("EventPictures")
            .getPublicUrl(event.image).data.publicUrl
    }))
})

export const Route = createFileRoute("/_public/agenda/")({
    loader: async () => ({
        currentEvents: await getCurrentEvents(),
        soonEvents: await getSoonEvents(),
        archivedEvents: await getArchivedEvents()
    }),
    head: () => ({
        meta: [
            { title: pageTitle("Agenda") },
            {
                name: "description",
                content: "Page regroupant les événements lié à la FARE"
            }
        ]
    }),
    component: Reseau
})

function Reseau() {
    const { currentEvents, soonEvents, archivedEvents } = Route.useLoaderData()

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-44 text-3xl font-semibold">L'Agenda du réseau</h1>
            <div className="flex h-full w-full flex-col items-center">
                <CurrentEvents events={currentEvents} />
                <SoonEvents events={soonEvents} />
                <EventArchive events={archivedEvents} />
            </div>
        </div>
    )
}
