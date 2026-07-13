import { type } from "arktype"
import { describe, expect, it } from "vitest"

import {
    AddAssociationSchema,
    EditAssociationSchema
} from "@/schemas/associations"

const isErrors = (out: object): boolean => out instanceof type.errors

const validAssociation = (
    overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
    name: "AAEMR",
    major: "Médecine",
    description: "Association des étudiant·e·s en médecine.",
    logo: new File([new Uint8Array([1, 2, 3])], "logo.png", {
        type: "image/png"
    }),
    birthdate: new Date("2015-06-01T00:00:00Z"),
    location: "6 Cours des Alliés, 35000 Rennes",
    email: "contact@asso.fr",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    discord: "",
    ...overrides
})

describe("AddAssociationSchema", () => {
    it("accepts a valid payload with empty optional links", () => {
        expect(isErrors(AddAssociationSchema(validAssociation()))).toBe(false)
    })

    it("accepts valid social links", () => {
        expect(
            isErrors(
                AddAssociationSchema(
                    validAssociation({
                        website: "https://www.fare-asso.fr",
                        instagram: "https://www.instagram.com/fare"
                    })
                )
            )
        ).toBe(false)
    })

    it("rejects an empty name", () => {
        expect(
            isErrors(AddAssociationSchema(validAssociation({ name: "" })))
        ).toBe(true)
    })

    it("rejects an invalid email", () => {
        expect(
            isErrors(
                AddAssociationSchema(validAssociation({ email: "pas-un-mail" }))
            )
        ).toBe(true)
    })

    it("rejects a non-URL social link", () => {
        expect(
            isErrors(
                AddAssociationSchema(
                    validAssociation({ website: "fare-asso.fr" })
                )
            )
        ).toBe(true)
    })

    it("rejects a logo with a disallowed mime type", () => {
        expect(
            isErrors(
                AddAssociationSchema(
                    validAssociation({
                        logo: new File(["x"], "doc.pdf", {
                            type: "application/pdf"
                        })
                    })
                )
            )
        ).toBe(true)
    })

    it("rejects a missing birthdate", () => {
        expect(
            isErrors(
                AddAssociationSchema(validAssociation({ birthdate: undefined }))
            )
        ).toBe(true)
    })
})

describe("EditAssociationSchema", () => {
    it("accepts a payload without a logo (le logo actuel est conservé)", () => {
        expect(
            isErrors(
                EditAssociationSchema(validAssociation({ logo: undefined }))
            )
        ).toBe(false)
    })

    it("still validates a provided logo", () => {
        expect(
            isErrors(
                EditAssociationSchema(
                    validAssociation({
                        logo: new File(["x"], "doc.pdf", {
                            type: "application/pdf"
                        })
                    })
                )
            )
        ).toBe(true)
    })

    it("still requires the other fields", () => {
        expect(
            isErrors(
                EditAssociationSchema(
                    validAssociation({ logo: undefined, name: "" })
                )
            )
        ).toBe(true)
    })
})
