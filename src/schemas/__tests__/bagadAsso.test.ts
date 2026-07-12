import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { validSuggestionInput } from "@/test/factories/bagadAsso"

import { BagadAssoSuggestionSchema } from "../bagadAsso"

describe("BagadAssoSuggestionSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(
            BagadAssoSuggestionSchema(validSuggestionInput())
        ).not.toBeInstanceOf(type.errors)
    })

    it("accepts the 'autre' equipment type", () => {
        expect(
            BagadAssoSuggestionSchema(
                validSuggestionInput({ equipmentType: "autre" })
            )
        ).not.toBeInstanceOf(type.errors)
    })

    it("rejects an equipment type outside the catalog list", () => {
        const res = BagadAssoSuggestionSchema({
            ...validSuggestionInput(),
            equipmentType: "Vaisselle"
        })
        expect(res).toBeInstanceOf(type.errors)
    })

    it("accepts an empty reference url but rejects an invalid one", () => {
        expect(
            BagadAssoSuggestionSchema(
                validSuggestionInput({ referenceUrl: "" })
            )
        ).not.toBeInstanceOf(type.errors)
        expect(
            BagadAssoSuggestionSchema(
                validSuggestionInput({ referenceUrl: "not-a-url" })
            )
        ).toBeInstanceOf(type.errors)
    })

    it("rejects an invalid contact email", () => {
        expect(
            BagadAssoSuggestionSchema(
                validSuggestionInput({ contactEmail: "nope" })
            )
        ).toBeInstanceOf(type.errors)
    })

    it("rejects an empty equipment name", () => {
        expect(
            BagadAssoSuggestionSchema(
                validSuggestionInput({ equipmentName: "" })
            )
        ).toBeInstanceOf(type.errors)
    })
})
