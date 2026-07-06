import { type } from "arktype"
import { describe, expect, it } from "vitest"

import {
    AssistanceFormSchema,
    MOYEN_CONTACT,
    SITUATIONS
} from "@/schemas/assistance"
import { validAssistanceForm } from "@/test/factories/assistance"
import { imageFile, pdfFile } from "@/test/factories/files"

const isErrors = (out: object): boolean => out instanceof type.errors

describe("AssistanceFormSchema — required fields", () => {
    it("accepts a fully valid payload", () => {
        expect(isErrors(AssistanceFormSchema(validAssistanceForm()))).toBe(
            false
        )
    })

    it.each(["prenom", "nom", "etablissement", "message"] as const)(
        "rejects an empty %s",
        (field) => {
            const input = validAssistanceForm({ [field]: "" })
            expect(isErrors(AssistanceFormSchema(input))).toBe(true)
        }
    )

    it("rejects an invalid email", () => {
        expect(
            isErrors(
                AssistanceFormSchema(
                    validAssistanceForm({ email: "not-an-email" })
                )
            )
        ).toBe(true)
    })

    it("treats ufr as optional", () => {
        const input = validAssistanceForm()
        delete (input as { ufr?: string }).ufr
        expect(isErrors(AssistanceFormSchema(input))).toBe(false)
    })

    it("rejects an empty captcha token", () => {
        expect(
            isErrors(
                AssistanceFormSchema(validAssistanceForm({ captchaToken: "" }))
            )
        ).toBe(true)
    })
})

describe("AssistanceFormSchema — enums & consent", () => {
    it("accepts both situation values", () => {
        for (const situation of ["univ", "exterieur"] as const) {
            expect(
                isErrors(
                    AssistanceFormSchema(validAssistanceForm({ situation }))
                )
            ).toBe(false)
        }
    })

    it("rejects an unknown situation", () => {
        const input = { ...validAssistanceForm(), situation: "ailleurs" }
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })

    it("rejects an unknown moyenContact", () => {
        const input = { ...validAssistanceForm(), moyenContact: "fax" }
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })

    it("requires consentement to be true", () => {
        const input = { ...validAssistanceForm(), consentement: false }
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })
})

describe("AssistanceFormSchema — telephone narrow", () => {
    it("requires a phone when contact is by telephone", () => {
        const input = validAssistanceForm({
            moyenContact: "telephone",
            telephone: ""
        })
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })

    it("accepts a valid phone when contact is by telephone", () => {
        const input = validAssistanceForm({
            moyenContact: "telephone",
            telephone: "0612345678"
        })
        expect(isErrors(AssistanceFormSchema(input))).toBe(false)
    })

    it("does not require a phone when contact is by email", () => {
        const input = validAssistanceForm({
            moyenContact: "email",
            telephone: ""
        })
        expect(isErrors(AssistanceFormSchema(input))).toBe(false)
    })

    it("rejects an invalid phone even by email", () => {
        const input = {
            ...validAssistanceForm({ moyenContact: "email" }),
            telephone: "abc"
        }
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })
})

describe("AssistanceFormSchema — attachments", () => {
    it("accepts up to 3 PDF/image files", () => {
        const input = validAssistanceForm({
            pieces: [imageFile(), pdfFile(), imageFile("b.webp", "image/webp")]
        })
        expect(isErrors(AssistanceFormSchema(input))).toBe(false)
    })

    it("rejects more than 3 files", () => {
        const input = validAssistanceForm({
            pieces: [pdfFile(), pdfFile(), pdfFile(), pdfFile()]
        })
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })

    it("rejects a file with a disallowed type", () => {
        const bad = new File([new Uint8Array([1])], "x.txt", {
            type: "text/plain"
        })
        const input = validAssistanceForm({ pieces: [bad] })
        expect(isErrors(AssistanceFormSchema(input))).toBe(true)
    })

    it("accepts an omitted pieces field", () => {
        const input = validAssistanceForm()
        delete (input as { pieces?: File[] }).pieces
        expect(isErrors(AssistanceFormSchema(input))).toBe(false)
    })
})

describe("SITUATIONS & MOYEN_CONTACT constants", () => {
    it("expose the expected keys and labels", () => {
        expect(Object.keys(SITUATIONS)).toEqual(["univ", "exterieur"])
        expect(SITUATIONS.univ.label).toBeTruthy()
        expect(SITUATIONS.exterieur.example).toBeTruthy()
        expect(MOYEN_CONTACT).toEqual({
            email: "Email",
            telephone: "Téléphone"
        })
    })
})
