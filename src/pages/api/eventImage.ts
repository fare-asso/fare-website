import type { APIRoute } from "astro"

import prisma from "@/helpers/db"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { useLogger, withEvlog } from "@/lib/evlog"

const handler = withEvlog(async (request: Request) => {
    const log = useLogger()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    log.set({ eventId: id })

    const event = await prisma.event.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (event == null) {
        log.set({ found: false })
        return Response.json({
            error: `Failed to fetch image for event (id: ${id})`
        })
    }

    const imagePath: string = event.image

    if (imagePath == null || imagePath === "") {
        log.set({ found: true, hasImage: false })
        return Response.json({
            error: `Failed to fetch image for event (id: ${id})`
        })
    }

    const imageUrl = new StorageUtils()
        .from("EventPictures")
        .getPublicUrl(imagePath)

    log.set({ found: true, hasImage: true })

    return Response.json({
        imageUrl,
        imagePath
    })
})

export const GET: APIRoute = (context) => handler(context.request)
