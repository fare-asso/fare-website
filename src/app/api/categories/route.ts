import prisma from "@/helpers/db"
import { useLogger, withEvlog } from "@/lib/evlog"

interface Category {
    id: number
    name: string
}

export const GET = withEvlog(async () => {
    const log = useLogger()

    const categories: Category[] = await prisma.category.findMany({
        select: {
            id: true,
            name: true
        }
    })

    log.set({ resultCount: categories.length })

    return Response.json({ categories })
})
