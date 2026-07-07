import * as Sentry from "@sentry/tanstackstart-react"
import { isNotFound, isRedirect } from "@tanstack/react-router"

import { useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

type WithServerActionOptions = {
    attachFormData?: boolean
}

// Carries a router redirect()/notFound() throw past withEvlog so it is not
// logged as a 500.
const CONTROL_FLOW = Symbol("evlog.controlFlow")

function isRouterControlFlow(error: unknown): boolean {
    return isRedirect(error) || isNotFound(error)
}

function isControlFlowResult(
    result: unknown
): result is { [CONTROL_FLOW]: unknown } {
    return (
        typeof result === "object" && result !== null && CONTROL_FLOW in result
    )
}

// A server action's RPC payload: FormData travels as the top-level value so
// the serverFn multipart encoding applies; any other arg list travels as a
// serialized array. Files nested in typed args are not supported by the
// serverFn serializer, so they are packed as Uint8Array records and revived
// server-side.
type PackedFile = {
    __tssFile: true
    name: string
    type: string
    lastModified: number
    bytes: Uint8Array
}

type Packed<T> = T extends File
    ? PackedFile
    : T extends Date | Uint8Array
      ? T
      : T extends (infer U)[]
        ? Packed<U>[]
        : T extends object
          ? { [K in keyof T]: Packed<T[K]> }
          : T

export type ActionPayload<A extends unknown[]> = A extends [FormData]
    ? FormData
    : Packed<A>

function isPackedFile(value: unknown): value is PackedFile {
    return (
        typeof value === "object" &&
        value !== null &&
        "__tssFile" in value &&
        (value as PackedFile).__tssFile === true
    )
}

async function packFiles(value: unknown): Promise<unknown> {
    if (value instanceof File) {
        return {
            __tssFile: true,
            name: value.name,
            type: value.type,
            lastModified: value.lastModified,
            bytes: new Uint8Array(await value.arrayBuffer())
        } satisfies PackedFile
    }
    if (Array.isArray(value)) {
        return Promise.all(value.map(packFiles))
    }
    if (
        value !== null &&
        typeof value === "object" &&
        Object.getPrototypeOf(value) === Object.prototype
    ) {
        const entries = await Promise.all(
            Object.entries(value).map(
                async ([key, entry]) => [key, await packFiles(entry)] as const
            )
        )
        return Object.fromEntries(entries)
    }
    return value
}

function unpackFiles(value: unknown): unknown {
    if (isPackedFile(value)) {
        return new File([value.bytes as BlobPart], value.name, {
            type: value.type,
            lastModified: value.lastModified
        })
    }
    if (Array.isArray(value)) {
        return value.map(unpackFiles)
    }
    if (
        value !== null &&
        typeof value === "object" &&
        Object.getPrototypeOf(value) === Object.prototype
    ) {
        const out: Record<string, unknown> = {}
        for (const [key, entry] of Object.entries(value)) {
            out[key] = unpackFiles(entry)
        }
        return out
    }
    return value
}

export async function packActionArgs<A extends unknown[]>(
    args: A
): Promise<ActionPayload<A>> {
    if (args.length === 1 && args[0] instanceof FormData) {
        return args[0] as ActionPayload<A>
    }
    return (await packFiles(args)) as ActionPayload<A>
}

export function unpackActionArgs<A extends unknown[]>(
    data: ActionPayload<A>
): A {
    if (data instanceof FormData) return [data] as unknown as A
    return unpackFiles(data) as A
}

export function withServerAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>,
    options: WithServerActionOptions = {}
): (...args: A) => Promise<R> {
    const instrumented = withEvlog(
        async (...args: A): Promise<R | { [CONTROL_FLOW]: unknown }> => {
            const log = useLogger()
            log.set({ action: name })

            // `{ value }` wrap stops tryCatch unwrapping a {data,error} shape.
            const settled = await tryCatch(async () => ({
                value: await handler(...args)
            }))
            if (!settled.success) {
                if (isRouterControlFlow(settled.error)) {
                    return { [CONTROL_FLOW]: settled.error }
                }
                throw settled.error
            }

            const { value } = settled.value
            if (value && typeof value === "object" && "success" in value) {
                log.set({ success: (value as { success: unknown }).success })
            }
            return value
        }
    )

    return async (...args: A): Promise<R> => {
        if (options.attachFormData) {
            const formData = args.find(
                (arg): arg is FormData => arg instanceof FormData
            )
            if (formData) {
                const fields: Record<string, string> = {}
                for (const [key, value] of formData.entries()) {
                    if (typeof value === "string") fields[key] = value
                }
                Sentry.getCurrentScope().setContext("formData", fields)
            }
        }

        const result = await Sentry.startSpan(
            { name: `serverAction/${name}`, op: "function.server_action" },
            () => instrumented(...args)
        )

        if (isControlFlowResult(result)) {
            throw result[CONTROL_FLOW]
        }
        return result as R
    }
}

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>,
    rethrow = true
): void {
    if (rethrow && isRouterControlFlow(error)) throw error
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
