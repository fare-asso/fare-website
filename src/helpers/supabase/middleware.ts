import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { clientEnv } from "@/env/client"

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers
        }
    })

    const supabase = createServerClient(
        clientEnv.VITE_SUPABASE_URL,
        clientEnv.VITE_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers
                        }
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers
                        }
                    })
                    response.cookies.set({
                        name,
                        value: "",
                        ...options
                    })
                }
            }
        }
    )

    await supabase.auth.getUser()

    return response
}
