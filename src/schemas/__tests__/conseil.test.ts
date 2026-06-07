import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { AddConseilSchema, EditConseilSchema } from "../conseil"

const isError = (out: unknown): boolean => out instanceof type.errors

describe("AddConseilSchema", () => {
    it("accepts a valid payload", () => {
        expect(
            isError(AddConseilSchema({ instanceId: 1, name: "Bureau" }))
        ).toBe(false)
    })

    it("rejects an empty name", () => {
        expect(isError(AddConseilSchema({ instanceId: 1, name: "" }))).toBe(
            true
        )
    })

    it("rejects a non-integer instanceId", () => {
        expect(
            isError(AddConseilSchema({ instanceId: 1.5, name: "Bureau" }))
        ).toBe(true)
    })
})

describe("EditConseilSchema", () => {
    it("accepts a valid payload", () => {
        expect(
            isError(EditConseilSchema({ id: 1, instanceId: 1, name: "Bureau" }))
        ).toBe(false)
    })

    it("requires an id", () => {
        expect(
            isError(EditConseilSchema({ instanceId: 1, name: "Bureau" }))
        ).toBe(true)
    })
})
