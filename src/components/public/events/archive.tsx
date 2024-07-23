import { Event } from "@prisma/client";
import EventCard from "./eventCard";
import { createClient } from "@/helpers/supabase/server";
import prisma from "@/helpers/db";

export default async function EventArchive() {

    const supabase = createClient();

    const now = new Date();

    const events = await prisma.event.findMany({
        where: {
            endTime: {
                lt : now
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

    if(events.length == 0) {
        return <></>
    }

    return (
        <div className="w-full flex flex-col mb-8">
            <span className="font-semibold text-2xl mb-4">Archives</span>
            <div className="w-full h-auto flex flex-col items-center space-y-3">
                {
                    events.length > 0 ? 
                    events.map((event) => <EventCard key={event.id} event={event} archive={true}
                    imageUrl={supabase.storage.from('EventPictures').getPublicUrl(event.image).data.publicUrl} />)
                    : null
                }
            </div>
            
        </div>
    )
}