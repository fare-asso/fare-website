import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { AddInstanceSchema, EditInstanceSchema } from "../instance"

const isError = (out: unknown): boolean => out instanceof type.errors

const imageFile = (name = "logo.png", mime = "image/png"): File =>
    new File([new Uint8Array([1])], name, { type: mime })

describe("AddInstanceSchema", () => {
    it("accepts a valid payload without logos", () => {
        expect(
            isError(
                AddInstanceSchema({
                    name: "Conseil",
                    contactEmail: "a@b.com"
                })
            )
        ).toBe(false)
    })

    it("rejects an invalid email", () => {
        expect(
            isError(
                AddInstanceSchema({ name: "Conseil", contactEmail: "nope" })
            )
        ).toBe(true)
    })

    it("rejects an empty name", () => {
        expect(
            isError(AddInstanceSchema({ name: "", contactEmail: "a@b.com" }))
        ).toBe(true)
    })

    it("rejects a description longer than 1000 chars", () => {
        expect(
            isError(
                AddInstanceSchema({
                    name: "Conseil",
                    contactEmail: "a@b.com",
                    description: "x".repeat(1001)
                })
            )
        ).toBe(true)
    })

    it("accepts a description of exactly 1000 chars", () => {
        expect(
            isError(
                AddInstanceSchema({
                    name: "Conseil",
                    contactEmail: "a@b.com",
                    description: "x".repeat(1000)
                })
            )
        ).toBe(false)
    })

    it("accepts image logos", () => {
        expect(
            isError(
                AddInstanceSchema({
                    name: "Conseil",
                    contactEmail: "a@b.com",
                    logos: [imageFile()]
                })
            )
        ).toBe(false)
    })

    it("rejects a non-image logo", () => {
        expect(
            isError(
                AddInstanceSchema({
                    name: "Conseil",
                    contactEmail: "a@b.com",
                    logos: [imageFile("doc.pdf", "application/pdf")]
                })
            )
        ).toBe(true)
    })
})

describe("EditInstanceSchema", () => {
    it("requires an id", () => {
        expect(
            isError(
                EditInstanceSchema({ name: "Conseil", contactEmail: "a@b.com" })
            )
        ).toBe(true)
    })

    it("accepts a valid payload", () => {
        expect(
            isError(
                EditInstanceSchema({
                    id: 1,
                    name: "Conseil",
                    contactEmail: "a@b.com"
                })
            )
        ).toBe(false)
    })
})
