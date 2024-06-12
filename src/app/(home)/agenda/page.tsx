import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";

export default async function Reseau() {

    const supabase = createClient();

    const events = await prisma.event.findMany();
    const eventCards = events.map((event) => {
        if(event.visibility == true) {
            return <div key={event.id}>{event.name}</div>
        }
    })
    return(
        <div className="flex flex-col items-center justify-start">
            <h1 className="py-44 text-3xl font-semibold">{"L'Agenda du réseau"}</h1>
            <div className="grid grid-cols-4 gap-8 w-3/4 h-full">
                {eventCards}
            </div>
        </div>
        
    )
}