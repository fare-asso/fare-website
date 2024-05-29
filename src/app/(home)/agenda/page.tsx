import prisma from "@/helpers/db";

export default async function Agenda() {
    const events = await prisma.event.findMany();
    const eventsElements = events.map((event) => <div key={event.id} className="text-black">{event.name}</div>)
    return(
        <>
            Les évènements
            {eventsElements}
        </>
        
    )
}