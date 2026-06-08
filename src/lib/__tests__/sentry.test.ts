import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({
    set: vi.fn(),
    captureException: vi.fn(),
    runInstrumentation: vi.fn(
        (_name: string, _opts: unknown, cb: () => unknown) => cb()
    )
}))

vi.mock("@/lib/evlog", () => ({
    withEvlog:
        <A extends unknown[], R>(handler: (...args: A) => R) =>
        (...args: A): R =>
            handler(...args),
    useLogger: () => ({ set: h.set })
}))
vi.mock("@sentry/nextjs", () => ({
    withServerActionInstrumentation: h.runInstrumentation,
    captureException: h.captureException
}))
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))

import { withServerAction } from "../sentry"

beforeEach(() => {
    vi.clearAllMocks()
})

describe("withServerAction", () => {
    it("returns the handler value and records action + success", async () => {
        const action = withServerAction("myAction", async (x: number) => ({
            success: true as const,
            value: x * 2
        }))
        expect(await action(21)).toEqual({ success: true, value: 42 })
        expect(h.set).toHaveBeenCalledWith({ action: "myAction" })
        expect(h.set).toHaveBeenCalledWith({ success: true })
    })

    it("records success:false for a handled failure", async () => {
        const action = withServerAction("failAction", async () => ({
            success: false as const,
            error: "nope"
        }))
        expect(await action()).toEqual({ success: false, error: "nope" })
        expect(h.set).toHaveBeenCalledWith({ success: false })
    })

    it("rethrows Next redirect control flow without capturing it", async () => {
        const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
            digest: "NEXT_REDIRECT;replace;/login;307;"
        })
        const action = withServerAction("redirectAction", async () => {
            throw redirectError
        })
        await expect(action()).rejects.toBe(redirectError)
        expect(h.captureException).not.toHaveBeenCalled()
    })

    it("rethrows genuine errors", async () => {
        const boom = new Error("boom")
        const action = withServerAction("throwAction", async () => {
            throw boom
        })
        await expect(action()).rejects.toBe(boom)
    })

    it("forwards all arguments to the handler", async () => {
        const handler = vi.fn(async (..._args: unknown[]) => undefined)
        const action = withServerAction("argsAction", handler)
        await action("a", 2, { c: true })
        expect(handler).toHaveBeenCalledWith("a", 2, { c: true })
    })
})
