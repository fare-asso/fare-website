import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import {
    validAddPartenaire,
    validEditPartenaire
} from "@/test/factories/partenaires"

import { AddPartenaireSchema, EditPartenaireSchema } from "../partenaires-schema"

const isErrors = (out: unknown): boolean => out instanceof type.errors

describe("AddPartenaireSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(isErrors(AddPartenaireSchema(validAddPartenaire()))).toBe(false)
    })

    it("rejects an empty name", () => {
        expect(
            isErrors(AddPartenaireSchema(validAddPartenaire({ name: "" })))
        ).toBe(true)
    })

    it("rejects an empty description", () => {
        expect(
            isErrors(
                AddPartenaireSchema(validAddPartenaire({ description: "" }))
            )
        ).toBe(true)
    })

    it("rejects a description longer than 1000 characters", () => {
        expect(
            isErrors(
                AddPartenaireSchema(
                    validAddPartenaire({ description: "a".repeat(1001) })
                )
            )
        ).toBe(true)
    })

    it("accepts a description of exactly 1000 characters", () => {
        expect(
            isErrors(
                AddPartenaireSchema(
                    validAddPartenaire({ description: "a".repeat(1000) })
                )
            )
        ).toBe(false)
    })

    it("rejects a missing logo", () => {
        const input = {
            name: "ACME",
            description: "ok"
        }
        expect(isErrors(AddPartenaireSchema(input))).toBe(true)
    })

    it("rejects a non-file logo", () => {
        const input = {
            ...validAddPartenaire(),
            logo: "not-a-file"
        }
        expect(isErrors(AddPartenaireSchema(input))).toBe(true)
    })

    it("rejects a PDF logo (wrong mime type)", () => {
        expect(
            isErrors(
                AddPartenaireSchema(
                    validAddPartenaire({ logo: pdfFile("logo.pdf") })
                )
            )
        ).toBe(true)
    })

    it("accepts every allowed image mime type", () => {
        for (const t of [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/svg+xml"
        ]) {
            const input = validAddPartenaire({
                logo: imageFile("logo", t)
            })
            expect(isErrors(AddPartenaireSchema(input))).toBe(false)
        }
    })
})

describe("EditPartenaireSchema", () => {
    it("accepts a payload without a logo (logo optional)", () => {
        expect(isErrors(EditPartenaireSchema(validEditPartenaire()))).toBe(
            false
        )
    })

    it("accepts a payload with a valid logo", () => {
        expect(
            isErrors(
                EditPartenaireSchema(
                    validEditPartenaire({ logo: imageFile() })
                )
            )
        ).toBe(false)
    })

    it("rejects a non-integer id", () => {
        expect(
            isErrors(
                EditPartenaireSchema(
                    validEditPartenaire({ id: 1.5 as unknown as number })
                )
            )
        ).toBe(true)
    })

    it("rejects an id < 1", () => {
        expect(
            isErrors(EditPartenaireSchema(validEditPartenaire({ id: 0 })))
        ).toBe(true)
    })

    it("rejects an empty name", () => {
        expect(
            isErrors(EditPartenaireSchema(validEditPartenaire({ name: "" })))
        ).toBe(true)
    })

    it("rejects an empty description", () => {
        expect(
            isErrors(
                EditPartenaireSchema(
                    validEditPartenaire({ description: "" })
                )
            )
        ).toBe(true)
    })

    it("rejects a description longer than 1000 characters", () => {
        expect(
            isErrors(
                EditPartenaireSchema(
                    validEditPartenaire({ description: "a".repeat(1001) })
                )
            )
        ).toBe(true)
    })

    it("rejects a PDF logo (wrong mime type)", () => {
        expect(
            isErrors(
                EditPartenaireSchema(
                    validEditPartenaire({ logo: pdfFile("logo.pdf") })
                )
            )
        ).toBe(true)
    })
})
