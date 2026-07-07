import { createFileRoute } from "@tanstack/react-router"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

type HealthStatus = {
    status: "ok" | "error"
    message: string
    data: {
        db: boolean
        supabase: boolean
        api: boolean
    }
    errors?: string[]
}

export const Route = createFileRoute("/api/health")({
    server: {
        handlers: {
            GET: withEvlog(async () => {
                const log = useLogger()
                const errors: string[] = []
                let dbHealthy = false
                let supabaseHealthy = false

                // Check Prisma/DB connection
                const dbResult = await tryCatch(prisma.$queryRaw`SELECT 1`)
                if (dbResult.success) {
                    dbHealthy = true
                } else {
                    const message =
                        dbResult.error instanceof Error
                            ? dbResult.error.message
                            : "Unknown DB error"
                    errors.push(`DB: ${message}`)
                }

                // Check Supabase connection
                const supabaseResult = await tryCatch(
                    createClient().auth.getSession()
                )
                if (supabaseResult.success) {
                    supabaseHealthy = true
                } else {
                    const err = supabaseResult.error
                    const message =
                        err && typeof err === "object" && "message" in err
                            ? String(err.message)
                            : "Unknown Supabase error"
                    errors.push(`Supabase: ${message}`)
                }

                const allHealthy = dbHealthy && supabaseHealthy

                const response: HealthStatus = {
                    status: allHealthy ? "ok" : "error",
                    message: allHealthy
                        ? "Health check passed"
                        : "Health check failed",
                    data: {
                        db: dbHealthy,
                        supabase: supabaseHealthy,
                        api: true
                    }
                }

                if (errors.length > 0) {
                    response.errors = errors
                }

                log.set({
                    db: dbHealthy,
                    supabase: supabaseHealthy,
                    healthy: allHealthy
                })

                return Response.json(response, {
                    status: allHealthy ? 200 : 503
                })
            })
        }
    }
})
