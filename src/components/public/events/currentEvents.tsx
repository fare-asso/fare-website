import type { Event } from "@/generated/prisma/client"

import EventCard from "./eventCard"

type AgendaEvent = Event & { category: { name: string }; imageUrl: string }

export default function CurrentEvents({ events }: { events: AgendaEvent[] }) {
    if (events.length === 0) {
        return null
    }

    return (
        <div className="mb-8 flex w-full flex-col">
            <span className="mb-4 text-2xl font-semibold">En ce moment</span>
            <div className="flex h-auto w-full flex-col items-center">
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        archive={false}
                        imageUrl={event.imageUrl}
                    />
                ))}
            </div>
        </div>
    )
}
