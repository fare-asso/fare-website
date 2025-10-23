import EventArchive from "@/components/public/events/archive";
import CurrentEvents from "@/components/public/events/currentEvents";
import SoonEvents from "@/components/public/events/soon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agenda | FARE",
    description: "Page regroupant les événements lié à la FARE",
};

export default async function Reseau() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-44 text-3xl font-semibold">
                {"L'Agenda du réseau"}
            </h1>
            <div className="flex h-full w-full flex-col items-center">
                <CurrentEvents />
                <SoonEvents />
                <EventArchive />
            </div>
        </div>
    );
}
