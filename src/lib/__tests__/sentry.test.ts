import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({
    set: vi.fn(),
    captureException: vi.fn(),
    runInstrumentation: vi.fn(
        (_name: string, _opts: unknown, cb: () => unknown) => cb()
    )
}))

vi.mock("@/lib/evlog.server", () => ({
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

import { packActionArgs, unpackActionArgs, withServerAction } from "../sentry"

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
        const argsActionImpl = vi.fn(async (..._args: unknown[]) => undefined)
        const action = withServerAction("argsAction", argsActionImpl)
        await action("a", 2, { c: true })
        expect(argsActionImpl).toHaveBeenCalledWith("a", 2, { c: true })
    })
})

describe("packActionArgs / unpackActionArgs", () => {
    it("round-trips a file larger than seroval's ~750 KB buffer cap", async () => {
        const big = new Uint8Array(1_500_000)
        for (let i = 0; i < big.length; i++) big[i] = i % 251
        const file = new File([big], "logo.png", {
            type: "image/png",
            lastModified: 42
        })
        const packed = await packActionArgs([{ name: "FARE", logo: file }])

        const packedFile = (
            packed as unknown as [{ logo: { bytes: Uint8Array[] } }]
        )[0].logo
        expect(packedFile.bytes.length).toBeGreaterThan(1)
        for (const chunk of packedFile.bytes) {
            // base64 length must stay under seroval's 1e6-char deserialize cap
            expect(Math.ceil(chunk.byteLength / 3) * 4).toBeLessThan(1_000_000)
        }

        const [arg] = unpackActionArgs<[{ name: string; logo: File }]>(packed)
        expect(arg.name).toBe("FARE")
        expect(arg.logo).toBeInstanceOf(File)
        expect(arg.logo.name).toBe("logo.png")
        expect(arg.logo.type).toBe("image/png")
        // Buffer.compare instead of toEqual: deep-equality over 1.5M
        // elements times out on slow CI runners
        const roundTripped = new Uint8Array(await arg.logo.arrayBuffer())
        expect(roundTripped.byteLength).toBe(big.byteLength)
        expect(Buffer.compare(roundTripped, big)).toBe(0)
    })

    it("passes top-level FormData through untouched", async () => {
        const fd = new FormData()
        expect(await packActionArgs([fd])).toBe(fd)
        expect(unpackActionArgs<[FormData]>(fd)).toEqual([fd])
    })
})
