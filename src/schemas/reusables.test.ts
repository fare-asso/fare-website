import { describe, expect, it } from "vitest"
import * as z from "zod/mini"
import { fileSchema } from "./reusables"

const pdf = new File([new Uint8Array([1])], "d.pdf", {
    type: "application/pdf"
})
const png = new File([new Uint8Array([1])], "i.png", { type: "image/png" })

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
