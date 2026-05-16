import { type } from "arktype"
import { describe, expect, it } from "vitest"
import { imageFile, pdfFile, validAdhesionForm } from "@/test/factories"
import { AdhesionFormSchema, bureauMemberSchema } from "./form-schema"

const isErrors = (out: object): boolean => out instanceof type.errors

describe("AdhesionFormSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(isErrors(AdhesionFormSchema(validAdhesionForm()))).toBe(false)
    })

    it("rejects a too-short sigle", () => {
        expect(
            isErrors(AdhesionFormSchema(validAdhesionForm({ sigle: "F" })))
        ).toBe(true)
    })

    it("rejects an invalid association email", () => {
        const input = validAdhesionForm({ emailAssociation: "not-an-email" })
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })

    it("rejects a college outside A | B", () => {
        const input = { ...validAdhesionForm(), college: "C" }
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })

    it("requires engagementCotisation to be true", () => {
        const input = { ...validAdhesionForm(), engagementCotisation: false }
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })

    it("requires at least one bureau member", () => {
        expect(
            isErrors(AdhesionFormSchema(validAdhesionForm({ bureau: [] })))
        ).toBe(true)
    })
})

describe("frenchPhone (telephonePortable)", () => {
    it("accepts a valid french phone without separators", () => {
        const input = validAdhesionForm({ telephonePortable: "0612345678" })
        expect(isErrors(AdhesionFormSchema(input))).toBe(false)
    })

    it("accepts a valid french phone with spaces", () => {
        const input = validAdhesionForm({
            telephonePortable: "06 12 34 56 78"
        })
        expect(isErrors(AdhesionFormSchema(input))).toBe(false)
    })

    it("accepts an empty string (optional)", () => {
        const input = validAdhesionForm({ telephonePortable: "" })
        expect(isErrors(AdhesionFormSchema(input))).toBe(false)
    })

    it("rejects a non-phone value", () => {
        const input = validAdhesionForm({ telephonePortable: "abc" })
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })
})

describe("bureauMemberSchema", () => {
    it("accepts a valid member", () => {
        expect(
            isErrors(
                bureauMemberSchema({
                    isAdmin: false,
                    poste: "Tresorier",
                    nom: "Martin",
                    prenom: "Lea",
                    filiere: "Droit",
                    annee: "M1",
                    telephone: "0612345678",
                    email: "lea@asso.fr",
                    adresse: "2 rue X, 35000 Rennes"
                })
            )
        ).toBe(false)
    })

    it("rejects a member with an empty poste", () => {
        expect(
            isErrors(
                bureauMemberSchema({
                    isAdmin: false,
                    poste: "",
                    nom: "Martin",
                    prenom: "Lea",
                    filiere: "Droit",
                    annee: "M1",
                    telephone: "0612345678",
                    email: "lea@asso.fr",
                    adresse: "2 rue X"
                })
            )
        ).toBe(true)
    })
})

// Characterization: documents how ArkType treats the embedded Zod fileSchema.
describe("file fields (characterization)", () => {
    it("validates the logo via the embedded schema", () => {
        const input = validAdhesionForm({ logo: pdfFile("logo.pdf") })
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })

    it("rejects a non-file logo value", () => {
        const input = { ...validAdhesionForm(), logo: "not-a-file" }
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })

    it("rejects a missing required document", () => {
        const input = validAdhesionForm({ statuts: imageFile("s.png") })
        expect(isErrors(AdhesionFormSchema(input))).toBe(true)
    })
})
