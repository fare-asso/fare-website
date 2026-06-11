import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { validAddLink, validEditLink } from "@/test/factories/links"

import {
    AddLinkCategorySchema,
    AddLinkSchema,
    EditLinkCategorySchema,
    EditLinkSchema
} from "../link"

const isError = (out: unknown): boolean => out instanceof type.errors

function summaryOf(out: unknown): string {
    if (!(out instanceof type.errors)) throw new Error("expected errors")
    return out.summary
}

describe("AddLinkCategorySchema", () => {
    it("accepts a valid payload", () => {
        expect(isError(AddLinkCategorySchema({ name: "Réseaux" }))).toBe(false)
    })

    it("rejects an empty name", () => {
        expect(isError(AddLinkCategorySchema({ name: "" }))).toBe(true)
    })
})

describe("EditLinkCategorySchema", () => {
    it("accepts a valid payload", () => {
        expect(
            isError(EditLinkCategorySchema({ id: 1, name: "Réseaux" }))
        ).toBe(false)
    })

    it("requires an id", () => {
        expect(isError(EditLinkCategorySchema({ name: "Réseaux" }))).toBe(true)
    })

    it("rejects a non-integer id", () => {
        expect(
            isError(EditLinkCategorySchema({ id: 1.5, name: "Réseaux" }))
        ).toBe(true)
    })
})

describe("AddLinkSchema", () => {
    it("accepts an absolute http(s) url", () => {
        expect(isError(AddLinkSchema(validAddLink()))).toBe(false)
        expect(
            isError(AddLinkSchema(validAddLink({ url: "http://fare-asso.fr" })))
        ).toBe(false)
    })

    it("accepts mailto and tel urls", () => {
        expect(
            isError(
                AddLinkSchema(
                    validAddLink({ url: "mailto:contact@fare-asso.fr" })
                )
            )
        ).toBe(false)
        expect(
            isError(AddLinkSchema(validAddLink({ url: "tel:+33600000000" })))
        ).toBe(false)
    })

    it("rejects a relative path with 'URL invalide'", () => {
        const out = AddLinkSchema(validAddLink({ url: "/projets/agorae" }))
        expect(summaryOf(out)).toBe("URL invalide")
    })

    it("rejects a non-url string with 'URL invalide'", () => {
        const out = AddLinkSchema(validAddLink({ url: "pas une url" }))
        expect(summaryOf(out)).toBe("URL invalide")
    })

    it("rejects an empty url with 'URL requise'", () => {
        const out = AddLinkSchema(validAddLink({ url: "" }))
        expect(summaryOf(out)).toBe("URL requise")
    })

    it("rejects an empty label", () => {
        expect(isError(AddLinkSchema(validAddLink({ label: "" })))).toBe(true)
    })

    it("rejects a non-integer categoryId", () => {
        expect(
            isError(AddLinkSchema(validAddLink({ categoryId: 1.5 })))
        ).toBe(true)
    })
})

describe("EditLinkSchema", () => {
    it("accepts a valid payload", () => {
        expect(isError(EditLinkSchema(validEditLink()))).toBe(false)
    })

    it("requires an id", () => {
        expect(isError(EditLinkSchema(validAddLink()))).toBe(true)
    })

    it("applies the same url rule as AddLinkSchema", () => {
        const out = EditLinkSchema(validEditLink({ url: "/projets/agorae" }))
        expect(summaryOf(out)).toBe("URL invalide")
    })
})
