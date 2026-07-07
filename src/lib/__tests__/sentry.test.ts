import { isRedirect, redirect } from "@tanstack/react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({
    set: vi.fn(),
    captureException: vi.fn(),
    startSpan: vi.fn((_opts: unknown, cb: () => unknown) => cb())
}))

vi.mock("@/lib/evlog.server", () => ({
    withEvlog:
        <A extends unknown[], R>(handler: (...args: A) => R) =>
        (...args: A): R =>
            handler(...args),
    useLogger: () => ({ set: h.set })
}))
vi.mock("@sentry/tanstackstart-react", () => ({
    startSpan: h.startSpan,
    captureException: h.captureException
}))

import { withServerAction } from "../sentry.server"

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
        expect(h.startSpan).toHaveBeenCalledWith(
            expect.objectContaining({ name: "serverAction/myAction" }),
            expect.any(Function)
        )
    })

    it("records success:false for a handled failure", async () => {
        const action = withServerAction("failAction", async () => ({
            success: false as const,
            error: "nope"
        }))
        expect(await action()).toEqual({ success: false, error: "nope" })
        expect(h.set).toHaveBeenCalledWith({ success: false })
    })

    it("rethrows router redirects without capturing them", async () => {
        const action = withServerAction("redirectAction", async () => {
            // oxlint-disable-next-line typescript/only-throw-error -- router control flow
            throw redirect({ href: "/login" })
        })
        await expect(action()).rejects.toSatisfy(isRedirect)
        expect(h.captureException).not.toHaveBeenCalled()
    })

    it("rethrows genuine errors", async () => {
        const boom = new Error("boom")
        const action = withServerAction("throwAction", async () => {
            throw boom
        })
        await expect(action()).rejects.toBe(boom)
    })

    it("forwards the serverFn context to the handler", async () => {
        const ctxAction = vi.fn(async (_ctx: { data: unknown }) => undefined)
        const action = withServerAction("ctxAction", ctxAction)
        await action({ data: { id: 7 } })
        expect(ctxAction).toHaveBeenCalledWith({ data: { id: 7 } })
    })
})
