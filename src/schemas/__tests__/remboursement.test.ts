import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import { validRemboursementForm } from "@/test/factories/remboursement"

import { RemboursementFormSchema } from "../remboursement"

const isErrors = (out: object): boolean => out instanceof type.errors

describe("RemboursementFormSchema — required fields", () => {
    it("accepts a fully valid payload", () => {
        expect(
            isErrors(RemboursementFormSchema(validRemboursementForm()))
        ).toBe(false)
    })

    it.each(["prenom", "nom", "email", "telephone"] as const)(
        "rejects an empty %s",
        (field) => {
            const input = validRemboursementForm({ [field]: "" })
            expect(isErrors(RemboursementFormSchema(input))).toBe(true)
        }
    )

    it.each(["prenom", "nom"] as const)(
        "rejects a whitespace-only %s",
        (field) => {
            const input = validRemboursementForm({ [field]: "   " })
            expect(isErrors(RemboursementFormSchema(input))).toBe(true)
        }
    )

    it("rejects an invalid email", () => {
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ email: "nope" })
                )
            )
        ).toBe(true)
    })

    it("rejects an invalid phone", () => {
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ telephone: "abc" })
                )
            )
        ).toBe(true)
    })

    it("accepts formatted French phones", () => {
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ telephone: "06 12 34 56 78" })
                )
            )
        ).toBe(false)
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ telephone: "06.12.34.56.78" })
                )
            )
        ).toBe(false)
    })

    it("requires a valid RIB file", () => {
        const missing = { ...validRemboursementForm(), rib: undefined }
        expect(isErrors(RemboursementFormSchema(missing))).toBe(true)

        const bad = new File([new Uint8Array([1])], "rib.txt", {
            type: "text/plain"
        })
        expect(
            isErrors(
                RemboursementFormSchema(validRemboursementForm({ rib: bad }))
            )
        ).toBe(true)
    })

    it("rejects an empty captcha token", () => {
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ captchaToken: "" })
                )
            )
        ).toBe(true)
    })
})

describe("RemboursementFormSchema — demandeur & association", () => {
    it("requires the association for an administrateur·ice", () => {
        const input = validRemboursementForm({ association: "   " })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it.each(["bureauTerritorial", "equipeTerritoriale"] as const)(
        "does not require the association for %s",
        (demandeur) => {
            const input = validRemboursementForm({
                demandeur,
                association: ""
            })
            expect(isErrors(RemboursementFormSchema(input))).toBe(false)
        }
    )

    it("rejects an unknown demandeur", () => {
        const input = { ...validRemboursementForm(), demandeur: "exterieur" }
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("rejects an unknown type", () => {
        const input = { ...validRemboursementForm(), type: "avion" }
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })
})

describe("RemboursementFormSchema — exigences per type", () => {
    it("rejects a train request missing dateVoyage, depart, or arrivee", () => {
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ dateVoyage: undefined })
                )
            )
        ).toBe(true)
        expect(
            isErrors(
                RemboursementFormSchema(validRemboursementForm({ depart: "" }))
            )
        ).toBe(true)
        expect(
            isErrors(
                RemboursementFormSchema(validRemboursementForm({ arrivee: "" }))
            )
        ).toBe(true)
    })

    it("accepts a dateVoyage serialized to an ISO string by the payload codec", () => {
        const out = RemboursementFormSchema(
            validRemboursementForm({
                dateVoyage: "2026-11-20T00:00:00.000Z" as unknown as Date
            })
        )
        expect(isErrors(out)).toBe(false)
    })

    it("accepts a complete car request and rejects one missing travel details", () => {
        expect(
            isErrors(
                RemboursementFormSchema(validRemboursementForm({ type: "car" }))
            )
        ).toBe(false)
        expect(
            isErrors(
                RemboursementFormSchema(
                    validRemboursementForm({ type: "car", depart: "" })
                )
            )
        ).toBe(true)
    })

    it("accepts a metro/bus request with only justificatifs", () => {
        const input = validRemboursementForm({
            type: "metroBus",
            dateVoyage: undefined,
            depart: "",
            arrivee: ""
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(false)
    })

    it("requires personnes for a voiture request", () => {
        const input = validRemboursementForm({
            type: "voiture",
            personnes: "",
            justificatifsPassagers: [imageFile("groupe.png")]
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("requires justificatifsPassagers for a voiture request", () => {
        const input = validRemboursementForm({
            type: "voiture",
            personnes: "Marie Durand (BDE Rennes)",
            justificatifsPassagers: []
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("accepts a complete voiture request", () => {
        const input = validRemboursementForm({
            type: "voiture",
            personnes: "Marie Durand (BDE Rennes), Jean Dupont (FARE)",
            justificatifsPassagers: [imageFile("groupe.png")]
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(false)
    })

    it("requires objet for an achat request", () => {
        const input = validRemboursementForm({
            type: "achat",
            objet: "",
            montantTTC: "12,50"
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("requires a positive montantTTC for an achat request", () => {
        for (const montantTTC of ["", "douze", "0", "0,00", "12,555"]) {
            const input = validRemboursementForm({
                type: "achat",
                objet: "Affiches",
                montantTTC
            })
            expect(isErrors(RemboursementFormSchema(input))).toBe(true)
        }
    })

    it("accepts a complete achat request with comma or dot decimals", () => {
        for (const montantTTC of ["12,50", "12.50", "12", " 12,5 "]) {
            const input = validRemboursementForm({
                type: "achat",
                dateVoyage: undefined,
                depart: "",
                arrivee: "",
                objet: "Affiches",
                montantTTC
            })
            expect(isErrors(RemboursementFormSchema(input))).toBe(false)
        }
    })
})

describe("RemboursementFormSchema — attachments", () => {
    it("rejects a request without justificatifs", () => {
        const input = validRemboursementForm({ justificatifs: [] })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("rejects a file with a disallowed type", () => {
        const bad = new File([new Uint8Array([1])], "x.txt", {
            type: "text/plain"
        })
        const input = validRemboursementForm({ justificatifs: [bad] })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("rejects a file larger than 2 Mo", () => {
        const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.pdf", {
            type: "application/pdf"
        })
        const input = validRemboursementForm({ justificatifs: [big] })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("rejects more than 5 files on one field", () => {
        const input = validRemboursementForm({
            justificatifs: [
                pdfFile(),
                pdfFile("2.pdf"),
                pdfFile("3.pdf"),
                pdfFile("4.pdf"),
                pdfFile("5.pdf"),
                pdfFile("6.pdf")
            ]
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(true)
    })

    it("accepts complementary metro/bus pieces", () => {
        const input = validRemboursementForm({
            piecesMetroBus: [imageFile("ticket.png")]
        })
        expect(isErrors(RemboursementFormSchema(input))).toBe(false)
    })
})
