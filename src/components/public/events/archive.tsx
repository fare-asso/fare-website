import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import EventCard from "./eventCard"

export default async function EventArchive() {
    const supabase = await createClient()

    const now = new Date()

    const events = await prisma.event.findMany({
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

    if (events.length === 0) {
        return <></>
    }

    return (
        <div className="mb-8 flex w-full flex-col">
            <span className="mb-4 font-semibold text-2xl">Archives</span>
            <div className="flex h-auto w-full flex-col items-center space-y-3">
                {events.length > 0
                    ? events.map((event) => (
                          <EventCard
                              key={event.id}
                              event={event}
                              archive={true}
                              imageUrl={
                                  supabase.storage
                                      .from("EventPictures")
                                      .getPublicUrl(event.image).data.publicUrl
                              }
                          />
                      ))
                    : null}
            </div>
        </div>
    )
}
