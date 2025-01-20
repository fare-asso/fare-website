import { Event } from "@prisma/client";
import EventCard from "./eventCard";
import { createClient } from "@/helpers/supabase/server";
import prisma from "@/helpers/db";

export default async function SoonEvents() {
    const now = new Date();

    const events = await prisma.event.findMany({
        where: {
            startTime: {
                gt: now,
            },
        },
        include: {
            category: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (events.length == 0) {
        return <></>;
    }

    const supabase = createClient();

    return (
        <div className="w-full flex flex-col mb-8">
            <span className="font-semibold text-2xl mb-4">Bientôt</span>
            <div className="w-full h-auto flex flex-col items-center">
                {events.length > 0
                    ? events.map((event) => (
                          <EventCard
                              key={event.id}
                              event={event}
                              archive={false}
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
    );
}
