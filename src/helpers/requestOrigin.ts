import { env } from "@/env"

// Only trust x-forwarded-host (set by the ingress); never the raw Host
// header, which is client-controllable. Fall back to the canonical URL.
export function requestOrigin(request: Request): string {
    const fallback = new URL(env.DOKPLOY_DEPLOY_URL || env.PUBLIC_SITE_URL)
    const host = request.headers.get("x-forwarded-host") ?? fallback.host
    const proto =
        request.headers.get("x-forwarded-proto") ??
        fallback.protocol.replace(":", "")
    return `${proto}://${host}`
}
