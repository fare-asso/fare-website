import { vi } from "vitest"

/**
 * Shared module-shape builders for `vi.mock` factories.
 *
 * Usage in a test file (the handles are created with `vi.hoisted` so they are
 * available to the hoisted `vi.mock` calls; the builders below only describe
 * the module shape and are invoked lazily inside the factory):
 *
 *     const h = vi.hoisted(() => ({
 *         create: vi.fn(),
 *         captureActionError: vi.fn(),
 *         revalidatePath: vi.fn()
 *     }))
 *     vi.mock("@/helpers/db", () => dbModule({ adhesion: { create: h.create } }))
 *     vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))
 *     vi.mock("next/cache", () => cacheModule(h.revalidatePath))
 */

type Fn = ReturnType<typeof vi.fn>

const NEXT_CONTROL_FLOW_DIGESTS = ["NEXT_REDIRECT", "NEXT_NOT_FOUND"]

function isNextControlFlow(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false
    const digest = (error as { digest?: unknown }).digest
    return (
        typeof digest === "string" &&
        NEXT_CONTROL_FLOW_DIGESTS.some((d) => digest.startsWith(d))
    )
}

/**
 * `@/lib/sentry` mock: `withServerAction` becomes a transparent passthrough so
 * tests exercise the real action body; `captureActionError` is a spy that still
 * rethrows Next `redirect()` / `notFound()` control-flow errors like the real
 * implementation does via `unstable_rethrow`.
 */
export function sentryModule(captureActionError?: Fn) {
    const spy =
        captureActionError ??
        vi.fn((error: unknown) => {
            if (isNextControlFlow(error)) throw error
        })
    return {
        withServerAction:
            <A extends unknown[], R>(
                _name: string,
                handler: (...args: A) => Promise<R>
            ) =>
            (...args: A): Promise<R> =>
                handler(...args),
        captureActionError: spy
    }
}

/** `@/helpers/db` mock — pass the Prisma delegate subtree the action touches. */
export function dbModule(client: Record<string, unknown>) {
    return { default: client }
}

/**
 * `@/helpers/supabase/server` mock. `storage` is the object returned by
 * `supabase.storage`; `auth`/`from` cover the non-storage clients.
 */
export function supabaseServerModule(client: {
    storage?: unknown
    auth?: unknown
    from?: unknown
}) {
    return {
        createClient: vi.fn(async () => client),
        createAdminClient: vi.fn(async () => client)
    }
}

/** `@/helpers/supabase/auth` mock. */
export function authModule(getCurrentUserWithPermissions: Fn) {
    return { getCurrentUserWithPermissions }
}

/** `@/helpers/email` mock. */
export function emailModule(sendEmail: Fn) {
    return { sendEmail }
}

/** `@/components/captcha/verify` mock. */
export function captchaModule(verifyCaptcha: Fn) {
    return { verifyCaptcha }
}

/** `next/cache` mock. */
export function cacheModule(revalidatePath: Fn, revalidateTag?: Fn) {
    return {
        revalidatePath,
        revalidateTag: revalidateTag ?? vi.fn()
    }
}

/** `next/navigation` mock — `redirect` throws a real `NEXT_REDIRECT` digest. */
export function navigationModule(redirect?: Fn, notFound?: Fn) {
    return {
        redirect:
            redirect ??
            vi.fn((url: string) => {
                const error = new Error("NEXT_REDIRECT") as Error & {
                    digest: string
                }
                error.digest = `NEXT_REDIRECT;replace;${url};307;`
                throw error
            }),
        notFound:
            notFound ??
            vi.fn(() => {
                const error = new Error("NEXT_NOT_FOUND") as Error & {
                    digest: string
                }
                error.digest = "NEXT_NOT_FOUND"
                throw error
            })
    }
}

/** `@react-email/render` mock — returns static markup. */
export function reactEmailRenderModule(html = "<html></html>") {
    return { render: vi.fn(async () => html) }
}

/**
 * `std-env` mock. The getter lets a test flip `isDevelopment` per case via the
 * hoisted ref object (see `process-adhesion` test).
 */
export function stdEnvModule(flags: {
    isDevelopment?: boolean
    isProduction?: boolean
}) {
    return {
        get isDevelopment() {
            return flags.isDevelopment ?? false
        },
        get isProduction() {
            return flags.isProduction ?? false
        }
    }
}
