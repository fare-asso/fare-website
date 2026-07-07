import { createFileRoute } from "@tanstack/react-router"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { useLogger, withEvlog } from "@/lib/evlog"

export const Route = createFileRoute("/api/eventImage")({
    server: {
        handlers: {
            GET: withEvlog(async ({ request }: { request: Request }) => {
                const log = useLogger()
                const supabase = createClient()

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

                const { data } = supabase.storage
                    .from("EventPictures")
                    .getPublicUrl(imagePath)

                log.set({ found: true, hasImage: true })

                return Response.json({
                    imageUrl: data.publicUrl,
                    imagePath: imagePath
                })
            })
        }
    }
})
