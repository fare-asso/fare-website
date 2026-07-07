import type { Event } from "@/generated/prisma/client"

import EventCard from "./eventCard"

type AgendaEvent = Event & { category: { name: string }; imageUrl: string }

export default function EventArchive({ events }: { events: AgendaEvent[] }) {
    if (events.length === 0) {
        return null
    }

    return (
        <div className="mb-8 flex w-full flex-col">
            <span className="mb-4 text-2xl font-semibold">Archives</span>
            <div className="flex h-auto w-full flex-col items-center space-y-3">
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        archive={true}
                        imageUrl={event.imageUrl}
                    />
                ))}
            </div>
        </div>
    )
}
