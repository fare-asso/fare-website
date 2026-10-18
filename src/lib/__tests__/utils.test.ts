/* oxlint-disable unicorn/no-thenable -- Intentional thenable fixtures exercise promise assimilation. */
import { runInNewContext } from "node:vm"

import { describe, expect, expectTypeOf, it, vi } from "vitest"

import { type SyncResult, tryCatch } from "@/lib/utils"

function asThenable<T>(promise: Promise<T>): PromiseLike<T> {
    return { then: promise.then.bind(promise) }
}

describe("tryCatch", () => {
    it("awaits a non-native thenable returned by a thunk", async () => {
        const value = { count: 1 }
        const thenable = asThenable(Promise.resolve(value))

        expect(thenable).not.toBeInstanceOf(Promise)
        const result = tryCatch(() => thenable)

        expectTypeOf(result).toEqualTypeOf<
            Promise<SyncResult<typeof value, Error>>
        >()
        expect(result).toBeInstanceOf(Promise)
        await expect(result).resolves.toEqual({
            success: true,
            value,
            error: null
        })
    })

    it("accepts a non-native thenable directly", async () => {
        const result = tryCatch(asThenable(Promise.resolve(42)))

        expectTypeOf(result).toEqualTypeOf<Promise<SyncResult<number, Error>>>()
        await expect(result).resolves.toEqual({
            success: true,
            value: 42,
            error: null
        })
    })

    it("captures a rejected thenable returned by a thunk", async () => {
        const error = new Error("query failed")
        const result = await tryCatch(() => asThenable(Promise.reject(error)))

        expect(result).toEqual({ success: false, value: null, error })
    })

    it("awaits a promise from another realm", async () => {
        const promise = runInNewContext(
            "Promise.resolve(42)"
        ) as Promise<number>

        expect(promise).not.toBeInstanceOf(Promise)
        await expect(tryCatch(() => promise)).resolves.toEqual({
            success: true,
            value: 42,
            error: null
        })
    })

    it("recognizes callable thenables returned by a thunk", async () => {
        const thenable = Object.assign(() => 0, asThenable(Promise.resolve(42)))

        await expect(tryCatch(() => thenable)).resolves.toEqual({
            success: true,
            value: 42,
            error: null
        })
    })

    it("recognizes inherited then methods and preserves their receiver", async () => {
        class Thenable implements PromiseLike<number> {
            readonly value = 42

            then<TResult1 = number, TResult2 = never>(
                onfulfilled?:
                    | ((value: number) => TResult1 | PromiseLike<TResult1>)
                    | null,
                onrejected?:
                    | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
                    | null
            ): PromiseLike<TResult1 | TResult2> {
                return Promise.resolve(this.value).then(onfulfilled, onrejected)
            }
        }

        await expect(tryCatch(() => new Thenable())).resolves.toEqual({
            success: true,
            value: 42,
            error: null
        })
    })

    it("captures a throwing then getter", () => {
        const error = new Error("then getter failed")
        const result = tryCatch(() => ({
            get then(): never {
                throw error
            }
        }))

        expect(result).toEqual({ success: false, value: null, error })
    })

    it("captures a throwing then method", async () => {
        const error = new Error("then method failed")
        const result = await tryCatch(() => ({
            then(): never {
                throw error
            }
        }))

        expect(result).toEqual({ success: false, value: null, error })
    })

    it("uses native promise settlement rules for misbehaving thenables", async () => {
        const thenable: PromiseLike<number> = {
            then(onfulfilled, onrejected): never {
                onfulfilled?.(42)
                onfulfilled?.(99)
                onrejected?.(new Error("too late"))
                throw new Error("also too late")
            }
        }
        const result = await tryCatch(() => thenable)

        expect(result).toEqual({ success: true, value: 42, error: null })
    })

    it.each([
        { value: undefined },
        { value: null },
        { value: false },
        { value: 0 },
        { value: "text" },
        { value: {} },
        { value: { then: null } },
        { value: { then: true } },
        { value: { then: "not callable" } }
    ])("keeps non-thenable values synchronous: $value", ({ value }) => {
        const result = tryCatch(() => value)

        expect(result).not.toBeInstanceOf(Promise)
        expect(result).toEqual({ success: true, value, error: null })
    })

    it("keeps ordinary function values synchronous", () => {
        const value = (): number => 42
        const result = tryCatch(() => value)

        expectTypeOf(result).toEqualTypeOf<SyncResult<typeof value, Error>>()
        expect(result).toEqual({ success: true, value, error: null })
    })

    it("calls a thunk only once and captures synchronous throws", () => {
        const error = new Error("sync failure")
        const thunk = vi.fn((): never => {
            throw error
        })

        expect(tryCatch(thunk)).toEqual({ success: false, value: null, error })
        expect(thunk).toHaveBeenCalledExactlyOnceWith()
    })

    it("still awaits native promises and async thunks", async () => {
        const expected = { success: true, value: 42, error: null }

        await expect(tryCatch(Promise.resolve(42))).resolves.toEqual(expected)
        await expect(tryCatch(async () => 42)).resolves.toEqual(expected)
    })

    it("still captures native promise rejections", async () => {
        const error = new Error("async failure")

        await expect(tryCatch(Promise.reject(error))).resolves.toEqual({
            success: false,
            value: null,
            error
        })
        await expect(tryCatch(() => Promise.reject(error))).resolves.toEqual({
            success: false,
            value: null,
            error
        })
    })

    it("unwraps data/error results after resolving a thenable", async () => {
        await expect(
            tryCatch(() =>
                asThenable(Promise.resolve({ data: 42, error: null }))
            )
        ).resolves.toEqual({ success: true, value: 42, error: null })

        const error = new Error("storage failure")
        await expect(
            tryCatch(() => asThenable(Promise.resolve({ data: null, error })))
        ).resolves.toEqual({ success: false, value: null, error })
    })
})
