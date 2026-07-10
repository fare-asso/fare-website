import { beforeEach, describe, expect, it, vi } from "vitest"

import type * as ActionModule from "@/lib/action"

const h = vi.hoisted(() => ({
    set: vi.fn(),
    startSpan: vi.fn((_opts: unknown, cb: () => unknown) => cb())
}))

vi.mock("@/lib/evlog", () => ({
    withEvlog:
        <A extends unknown[], R>(handler: (...args: A) => R) =>
        (...args: A): R =>
            handler(...args),
    useLogger: () => ({ set: h.set })
}))
vi.mock("@sentry/astro", () => ({ startSpan: h.startSpan }))

const { wrapAction } =
    await vi.importActual<typeof ActionModule>("@/lib/action")

beforeEach(() => {
    vi.clearAllMocks()
})

describe("wrapAction", () => {
    it("returns the handler value and records action + success", async () => {
        const action = wrapAction("myAction", async (x: number) => ({
            success: true as const,
            value: x * 2
        }))
        expect(await action(21)).toEqual({ success: true, value: 42 })
        expect(h.set).toHaveBeenCalledWith({ action: "myAction" })
        expect(h.set).toHaveBeenCalledWith({ success: true })
    })

    it("records success:false for a handled failure", async () => {
        const action = wrapAction("failAction", async () => ({
            success: false as const,
            error: "nope"
        }))
        expect(await action(undefined)).toEqual({
            success: false,
            error: "nope"
        })
        expect(h.set).toHaveBeenCalledWith({ success: false })
    })

    it("records only the action name for a plain value", async () => {
        const action = wrapAction("plainAction", async () => 42)
        expect(await action(undefined)).toBe(42)
        expect(h.set).toHaveBeenCalledWith({ action: "plainAction" })
        expect(h.set).toHaveBeenCalledTimes(1)
    })

    it("propagates thrown errors", async () => {
        const boom = new Error("boom")
        const action = wrapAction("throwAction", async () => {
            throw boom
        })
        await expect(action(undefined)).rejects.toBe(boom)
    })

    it("forwards the input and context to the handler", async () => {
        const impl = vi.fn(async (..._args: unknown[]) => undefined)
        // oxlint-disable-next-line local/require-action-name-matches
        const action = wrapAction("argsAction", impl)
        const context = { request: {} } as never
        await action("a", context)
        expect(impl).toHaveBeenCalledWith("a", context)
    })

    it("runs the handler inside a Sentry span", async () => {
        const action = wrapAction("spanAction", async () => "ok")
        await action(undefined)
        expect(h.startSpan).toHaveBeenCalledWith(
            { name: "spanAction", op: "action" },
            expect.any(Function)
        )
    })
})
