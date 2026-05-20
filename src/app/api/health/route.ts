import { NextResponse } from "next/server"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
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

export async function GET() {
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
        (async () => {
            const supabase = await createClient()
            return supabase.auth.getSession()
        })()
    )
    if (!supabaseResult.success) {
        const message =
            supabaseResult.error instanceof Error
                ? supabaseResult.error.message
                : "Unknown Supabase error"
        errors.push(`Supabase: ${message}`)
    } else if (supabaseResult.value.error) {
        errors.push(`Supabase: ${supabaseResult.value.error.message}`)
    } else {
        supabaseHealthy = true
    }

    const allHealthy = dbHealthy && supabaseHealthy

    const response: HealthStatus = {
        status: allHealthy ? "ok" : "error",
        message: allHealthy ? "Health check passed" : "Health check failed",
        data: {
            db: dbHealthy,
            supabase: supabaseHealthy,
            api: true
        }
    }

    if (errors.length > 0) {
        response.errors = errors
    }

    return NextResponse.json(response, {
        status: allHealthy ? 200 : 503
    })
}
