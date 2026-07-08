import type { APIRoute } from "astro"

import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"

const MAX_STORAGE_GB = 1

export const GET: APIRoute = async (context) => {
    const user = await getUserWithPermissions(context)
    if (!user) return new Response(null, { status: 401 })

    const supabase = createClient(context)
    const storageSize: number = (
        await supabase.rpc("total_storage_used_all_buckets")
    ).data

    if (Number.isNaN(storageSize)) {
        return new Response(null, { status: 500 })
    }

    return Response.json({
        used: storageSize / 1024 / 1024 / 1024,
        total: MAX_STORAGE_GB
    })
}
