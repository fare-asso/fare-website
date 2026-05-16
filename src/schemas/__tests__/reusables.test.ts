import { type } from "arktype"
import { describe, expect, it } from "vitest"
import * as z from "zod/mini"
import { fileSchema, frenchPhone } from "../reusables"

const pdf = new File([new Uint8Array([1])], "d.pdf", {
    type: "application/pdf"
})
const png = new File([new Uint8Array([1])], "i.png", { type: "image/png" })

const isErrors = (out: unknown): boolean => out instanceof type.errors

describe("frenchPhone (telephonePortable)", () => {
    it("accepts a valid french phone without separators", () => {
        expect(isErrors(frenchPhone("0612345678"))).toBe(false)
    })

    it("accepts a valid french phone with spaces", () => {
        expect(isErrors(frenchPhone("06 12 34 56 78"))).toBe(false)
    })

    it("accepts an empty string (optional)", () => {
        expect(isErrors(frenchPhone(""))).toBe(false)
    })

    it("rejects a non-phone value", () => {
        expect(isErrors(frenchPhone("abc"))).toBe(true)
    })
})

describe("fileSchema", () => {
    it("accepts a PDF file by default", () => {
        expect(z.safeParse(fileSchema(), pdf).success).toBe(true)
    })

    it("rejects a non-PDF file by default", () => {
        expect(z.safeParse(fileSchema(), png).success).toBe(false)
    })

    it("rejects a missing file", () => {
        expect(z.safeParse(fileSchema(), undefined).success).toBe(false)
    })

    it("accepts all allowed image mime types", () => {
        const schema = fileSchema({ mimeType: "image" })
        for (const t of [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/svg+xml"
        ]) {
            const f = new File([new Uint8Array([1])], "i", { type: t })
            expect(z.safeParse(schema, f).success).toBe(true)
        }
    })

    it("rejects a PDF when an image is expected", () => {
        const schema = fileSchema({ mimeType: "image" })
        expect(z.safeParse(schema, pdf).success).toBe(false)
    })

    it("accepts undefined when optional", () => {
        const schema = fileSchema({ optional: true })
        expect(z.safeParse(schema, undefined).success).toBe(true)
    })

    it("surfaces the custom error message", () => {
        const schema = fileSchema({ errorMessage: "Fichier requis" })
        const result = z.safeParse(schema, undefined)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Fichier requis")
        }
    })
})

describe("fileSchema combined mime types", () => {
    const svg = new File([new Uint8Array([1])], "v.svg", {
        type: "image/svg+xml"
    })
    const txt = new File([new Uint8Array([1])], "t.txt", {
        type: "text/plain"
    })

    it("accepts both PDF and image when given an array of keys", () => {
        const schema = fileSchema({ mimeType: ["image", "pdf"] })
        expect(z.safeParse(schema, pdf).success).toBe(true)
        expect(z.safeParse(schema, png).success).toBe(true)
        expect(z.safeParse(schema, svg).success).toBe(true)
    })

    it("rejects a type outside the combined set", () => {
        const schema = fileSchema({ mimeType: ["image", "pdf"] })
        expect(z.safeParse(schema, txt).success).toBe(false)
    })

    it("uses a combined default type-error message", () => {
        const schema = fileSchema({ mimeType: ["image", "pdf"] })
        const result = z.safeParse(schema, txt)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toContain("PDF")
        }
    })

    it("treats a single-element array like the scalar form", () => {
        const schema = fileSchema({ mimeType: ["image"] })
        expect(z.safeParse(schema, png).success).toBe(true)
        expect(z.safeParse(schema, pdf).success).toBe(false)
    })

    it("still supports the optional flag with arrays", () => {
        const schema = fileSchema({
            mimeType: ["image", "pdf"],
            optional: true
        })
        expect(z.safeParse(schema, undefined).success).toBe(true)
    })
})
