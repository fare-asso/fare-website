import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

export async function GET(request: Request) {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const event = await prisma.event.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (event == null) {
        return Response.json({
            error: "Failed to fetch image for event (id: " + id + ")"
        })
    }

    const imagePath: string = event.image

    if (imagePath == null || imagePath == "") {
        return Response.json({
            error: "Failed to fetch image for event (id: " + id + ")"
        })
    }

    const { data } = supabase.storage
        .from("EventPictures")
        .getPublicUrl(imagePath)

    return Response.json({
        imageUrl: data.publicUrl,
        imagePath: imagePath
    })
}
