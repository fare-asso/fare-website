import type { APIRoute } from "astro"

import prisma from "@/helpers/db"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export const GET: APIRoute = async ({ request, locals }) => {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    locals.log.set({ eventId: id })

    const event = await prisma.event.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (event == null) {
        locals.log.set({ found: false })
        return Response.json({
            error: `Failed to fetch image for event (id: ${id})`
        })
    }

    const imagePath: string = event.image

    if (imagePath == null || imagePath === "") {
        locals.log.set({ found: true, hasImage: false })
        return Response.json({
            error: `Failed to fetch image for event (id: ${id})`
        })
    }

    const imageUrl = new StorageUtils()
        .from("EventPictures")
        .getPublicUrl(imagePath)

    locals.log.set({ found: true, hasImage: true })

    return Response.json({
        imageUrl,
        imagePath
    })
}
