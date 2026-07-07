import { createFileRoute } from "@tanstack/react-router"

import prisma from "@/helpers/db"
import { useLogger, withEvlog } from "@/lib/evlog"

interface Category {
    id: number
    name: string
}

export const Route = createFileRoute("/api/categories")({
    server: {
        handlers: {
            GET: withEvlog(async () => {
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
        }
    }
})
