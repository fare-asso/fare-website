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
        expect(await action()).toEqual({ success: false, error: "nope" })
        expect(h.set).toHaveBeenCalledWith({ success: false })
    })

    it("records only the action name for a plain value", async () => {
        const action = wrapAction("plainAction", async () => 42)
        expect(await action()).toBe(42)
        expect(h.set).toHaveBeenCalledWith({ action: "plainAction" })
        expect(h.set).toHaveBeenCalledTimes(1)
    })

    it("propagates thrown errors", async () => {
        const boom = new Error("boom")
        const action = wrapAction("throwAction", async () => {
            throw boom
        })
        await expect(action()).rejects.toBe(boom)
    })

    it("forwards all arguments to the handler", async () => {
        const impl = vi.fn(async (..._args: unknown[]) => undefined)
        // oxlint-disable-next-line local/require-action-name-matches -- test double, not a real action
        const action = wrapAction("argsAction", impl)
        await action("a", 2, { c: true })
        expect(impl).toHaveBeenCalledWith("a", 2, { c: true })
    })

    it("runs the handler inside a Sentry span", async () => {
        const action = wrapAction("spanAction", async () => "ok")
        await action()
        expect(h.startSpan).toHaveBeenCalledWith(
            { name: "spanAction", op: "action" },
            expect.any(Function)
        )
    })
})
