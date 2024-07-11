import EventArchive from "@/components/public/events/archive";
import CurrentEvents from "@/components/public/events/currentEvents";
import SoonEvents from "@/components/public/events/soon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agenda | FAHB",
    description: "Page regroupant les événements lié à la FAHB"
}


export default async function Reseau() {

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-44 text-3xl font-semibold">{"L'Agenda du réseau"}</h1>
            <div className="flex flex-col w-full h-full items-center">

                <CurrentEvents />
                <SoonEvents />
                <EventArchive/>
                
            </div>
        </div>
        
    )
}