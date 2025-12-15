import type { Metadata } from "next"
import EventArchive from "@/components/public/events/archive"
import CurrentEvents from "@/components/public/events/currentEvents"
import SoonEvents from "@/components/public/events/soon"

export const metadata: Metadata = {
    title: "Agenda",
    description: "Page regroupant les événements lié à la FARE"
}

export default function Reseau() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-44 font-semibold text-3xl">
                {"L'Agenda du réseau"}
            </h1>
            <div className="flex h-full w-full flex-col items-center">
                <CurrentEvents />
                <SoonEvents />
                <EventArchive />
            </div>
        </div>
    )
}
