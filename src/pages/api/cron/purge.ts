import { timingSafeEqual } from "node:crypto"

import type { APIRoute } from "astro"

import { env } from "@/env"
import { runPurge } from "@/lib/purge"

function isAuthorized(request: Request): boolean {
    const secret = env.CRON_SECRET
    if (!secret) return false
    const header = request.headers.get("Authorization") ?? ""
    const expected = `Bearer ${secret}`
    const a = Buffer.from(header)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}

export const POST: APIRoute = async ({ request, locals }) => {
    if (!isAuthorized(request)) {
        return new Response("Unauthorized", { status: 401 })
    }
    const summary = await runPurge()
    locals.log.set({ ...summary })
    return Response.json({ success: true, summary })
}
