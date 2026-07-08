import { createServerClient, parseCookieHeader } from "@supabase/ssr"
import type { APIContext } from "astro"

import { env } from "@/env"

import prisma from "../db"
import type { UserWithPermissions } from "./auth"

export type RequestContext = Pick<APIContext, "request" | "cookies">

export function createClient({ request, cookies }: RequestContext) {
    return createServerClient(
        env.PUBLIC_SUPABASE_URL,
        env.PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return parseCookieHeader(
                        request.headers.get("Cookie") ?? ""
                    ).map(({ name, value }) => ({ name, value: value ?? "" }))
                },
                setAll(cookiesToSet) {
                    for (const { name, value, options } of cookiesToSet) {
                        cookies.set(name, value, options)
                    }
                }
            }
        }
    )
}

export async function getUserWithPermissions(
    context: RequestContext
): Promise<UserWithPermissions | null> {
    const supabase = createClient(context)
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return null

    return prisma.user.findFirst({
        where: { id: user.id, deletedAt: null },
        include: { permissions: { include: { permission: true } } }
    })
}
