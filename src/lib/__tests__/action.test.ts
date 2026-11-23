import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({
    set: vi.fn(),
    startSpan: vi.fn((_opts: unknown, cb: () => unknown) => cb())
}))

vi.mock("@sentry/astro", () => ({ startSpan: h.startSpan }))

import { instrumentAction } from "@/lib/action"

const mockContext = {
    locals: { log: { set: h.set } }
} as never

beforeEach(() => {
    vi.clearAllMocks()
})

describe("instrumentAction", () => {
    it("returns the handler value and records action + success", async () => {
        const action = instrumentAction(async function myAction(x: number) {
            return {
                success: true as const,
                value: x * 2
            }
        })
        expect(await action(21, mockContext)).toEqual({
            success: true,
            value: 42
        })
        expect(h.set).toHaveBeenCalledWith({ action: "myAction" })
        expect(h.set).toHaveBeenCalledWith({ success: true })
    })

    it("records success:false for a handled failure", async () => {
        const action = instrumentAction(async function failAction() {
            return {
                success: false as const,
                error: "nope"
            }
        })
        expect(await action(undefined, mockContext)).toEqual({
            success: false,
            error: "nope"
        })
        expect(h.set).toHaveBeenCalledWith({ success: false })
    })

    it("records only the action name for a plain value", async () => {
        const action = instrumentAction(async function plainAction() {
            return 42
        })
        expect(await action(undefined, mockContext)).toBe(42)
        expect(h.set).toHaveBeenCalledWith({ action: "plainAction" })
        expect(h.set).toHaveBeenCalledTimes(1)
    })

    it("propagates thrown errors", async () => {
        const boom = new Error("boom")
        const action = instrumentAction(async function throwAction() {
            throw boom
        })
        await expect(action(undefined, mockContext)).rejects.toBe(boom)
    })

    it("forwards the input and context to the handler", async () => {
        const impl = vi.fn(async (..._args: unknown[]) => undefined)
        const action = instrumentAction(impl)
        const context = {
            request: {},
            locals: { log: { set: h.set } }
        } as never
        await action("a", context)
        expect(impl).toHaveBeenCalledWith("a", context)
    })

    it("runs the handler inside a Sentry span", async () => {
        const action = instrumentAction(async function spanAction() {
            return "ok"
        })
        expect(await action(undefined, mockContext)).toBe("ok")
        expect(h.startSpan).toHaveBeenCalledWith(
            { name: "spanAction", op: "action" },
            expect.any(Function)
        )
    })
})
