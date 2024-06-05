'use server';

import prisma from "@/helpers/db";
import { revalidatePath } from "next/cache";

import { createClient } from "@/helpers/supabase/server";

export default async function deleteEventAction({eventId} : {eventId : number}) {

    // create supabase client
    const supabase = createClient();

    // fetch event Image url
    const imageUrl = await prisma.event.findUnique({
        where: {
            id : eventId
        }, 
        select : {
            image : true
        }
    });

    // check imageUrl validity and remove it from the storage
    if(imageUrl != null && typeof imageUrl == 'string') {
        if(imageUrl == "") { // no url
            console.log("No image to remove")
        } else {
            // remove image from the storage
            const res = await supabase.storage.from('EventPictures').remove(imageUrl);

            if(res.error) {
                console.error('Failed to delete Url')
                return
            }
        }
    }

    try {
        const response = await prisma.event.delete({
            where: {
                id: eventId
            }
        })
        revalidatePath('/dashboard/events');
    } catch (error) {
        console.error(error)
    }
    
}