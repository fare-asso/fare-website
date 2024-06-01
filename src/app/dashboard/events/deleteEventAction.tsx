'use server';

import prisma from "@/helpers/db";
import { revalidatePath } from "next/cache";

export default async function deleteEventAction({eventId} : {eventId : number}) {
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