import type { Event } from "@/app/dashboard/events/columns"

import prisma from "@/helpers/db"

export async function getData(): Promise<Event[]> {
    const events = await prisma.event.findMany({
        select: {
            id: true,
            name: true,
            desc: true,
            startTime: true,
            endTime: true,
            location: true,
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            createdBy: {
                select: {
                    id: true,
                    name: true
                }
            },
            visibility: true
        },
        orderBy: {
            startTime: "desc"
        }
    })
    return events
}
