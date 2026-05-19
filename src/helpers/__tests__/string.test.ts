import { describe, expect, it } from "vitest"

import { sanitizeString } from "../string"

describe("sanitizeString", () => {
    it("removes diacritics and lowercases", () => {
        expect(sanitizeString("Élève À Côté")).toBe("eleveacote")
    })

    it("strips characters outside [a-z0-9.-]", () => {
        expect(sanitizeString("FARE 2024!")).toBe("fare2024")
    })

    it("keeps dots and hyphens", () => {
        expect(sanitizeString("a.b-c")).toBe("a.b-c")
    })

    it("returns an empty string for an empty input", () => {
        expect(sanitizeString("")).toBe("")
    })
})
