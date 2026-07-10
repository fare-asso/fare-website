import type { APIRoute } from "astro"

import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"

const MAX_DB_SIZE_GB = 0.5

export const GET: APIRoute = async (context) => {
    const user = await getUserWithPermissions(context)
    if (!user) return new Response(null, { status: 401 })

    const supabase = createClient(context)
    const dbSize: number = (await supabase.rpc("total_database_size")).data

    if (Number.isNaN(dbSize)) {
        return new Response(null, { status: 500 })
    }

    return Response.json({
        used: dbSize / 1024 / 1024 / 1024,
        total: MAX_DB_SIZE_GB
    })
}
