import { isNotFound, isRedirect } from "@tanstack/react-router"
/**
 * Shared module-shape builders for `vi.mock` factories.
 *
 * Usage in a test file (the handles are created with `vi.hoisted` so they are
 * available to the hoisted `vi.mock` calls; the builders below only describe
 * the module shape and are invoked lazily inside the factory):
 *
 *     const h = vi.hoisted(() => ({
 *         create: vi.fn(),
 *         captureActionError: vi.fn()
 *     }))
 *     vi.mock("@/helpers/db.server", () => dbModule({ adhesion: { create: h.create } }))
 *     vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))
 */
import { vi } from "vitest"

type Fn = ReturnType<typeof vi.fn>

function isRouterControlFlow(error: unknown): boolean {
    return isRedirect(error) || isNotFound(error)
}

/**
 * `@/lib/sentry.server` mock: `withServerAction` becomes a transparent
 * passthrough so tests exercise the real handler body; `captureActionError`
 * is a spy that still rethrows router `redirect()` / `notFound()`
 * control-flow errors like the real implementation.
 */
export function sentryModule(captureActionError?: Fn) {
    const spy =
        captureActionError ??
        vi.fn((error: unknown) => {
            if (isRouterControlFlow(error)) throw error
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

/**
 * `@tanstack/react-start` mock — `createServerFn` becomes a plain builder that
 * invokes the handler directly (no RPC / compilation step in node tests).
 */
export function startModule() {
    const builder = (handlers: {
        validator?: (input: unknown) => unknown
    }) => ({
        inputValidator: (validator: (input: unknown) => unknown) =>
            builder({ validator }),
        validator: (validator: (input: unknown) => unknown) =>
            builder({ validator }),
        middleware: () => builder(handlers),
        handler:
            (fn: (ctx: { data: unknown }) => unknown) =>
            (opts?: { data?: unknown }) =>
                fn({
                    data: handlers.validator
                        ? handlers.validator(opts?.data)
                        : opts?.data
                })
    })
    return {
        createServerFn: () => builder({})
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
        createClient: vi.fn(() => client),
        createAdminClient: vi.fn(() => client)
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

/** `react-email` mock — returns static markup. */
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
