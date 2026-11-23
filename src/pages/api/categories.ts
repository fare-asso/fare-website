import type { APIRoute } from "astro"

import prisma from "@/helpers/db"

interface Category {
    id: number
    name: string
}

export const GET: APIRoute = async ({ locals }) => {
    const categories: Category[] = await prisma.category.findMany({
        select: {
            id: true,
            name: true
        }
    })

    locals.log.set({ resultCount: categories.length })

    return Response.json({ categories })
}
