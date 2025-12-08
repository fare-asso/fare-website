import { NextResponse } from "next/server"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

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
    try {
        await prisma.$queryRaw`SELECT 1`
        dbHealthy = true
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown DB error"
        errors.push(`DB: ${message}`)
    }

    // Check Supabase connection
    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.getSession()
        if (error) {
            errors.push(`Supabase: ${error.message}`)
        } else {
            supabaseHealthy = true
        }
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown Supabase error"
        errors.push(`Supabase: ${message}`)
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
