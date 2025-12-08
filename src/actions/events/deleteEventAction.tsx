"use server"

import prisma from "@/helpers/db"
import { revalidatePath } from "next/cache"

import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function deleteEventAction({
    eventId
}: {
    eventId: number
}) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

    // fetch event Image url
    const imageUrl = await prisma.event.findUnique({
        where: {
            id: eventId
        },
        select: {
            image: true
        }
    })

    // check imageUrl validity and remove it from the storage
    if (imageUrl != null && typeof imageUrl == "string") {
        if (imageUrl == "") {
            // no url
            console.log("No image to remove")
        } else {
            // remove image from the storage
            const res = await supabase.storage
                .from("EventPictures")
                .remove(imageUrl)

            if (res.error) {
                console.error("Failed to delete Url")
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
        revalidatePath("/dashboard/events")
    } catch (error) {
        console.error(error)
    }
}
