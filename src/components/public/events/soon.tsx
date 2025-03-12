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

    const supabase = await createClient();

    return (
        <div className="mb-8 flex w-full flex-col">
            <span className="mb-4 text-2xl font-semibold">Bientôt</span>
            <div className="flex h-auto w-full flex-col items-center">
                {events.length > 0 ?
                    events.map((event) => (
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
                :   null}
            </div>
        </div>
    );
}
