import {
    decodePDFRawStream,
    PDFArray,
    PDFDocument,
    PDFName,
    PDFRawStream
} from "pdf-lib"
import { describe, expect, it } from "vitest"

import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

import { generateContractPdf } from "../generateContractPdf"

const equipments = [
    { id: 1, name: "Barnum", quantity: 2, deposit: 50 },
    { id: 2, name: "Projecteur", quantity: 1, deposit: 25 }
]
const today = new Date("2026-09-01T00:00:00Z")

function pageTextOperators(doc: PDFDocument): string {
    return doc
        .getPages()
        .flatMap((page) => {
            const contents = page.node.Contents()
            const streams =
                contents instanceof PDFArray
                    ? contents.asArray()
                    : contents
                      ? [contents]
                      : []
            return streams.map((stream) => {
                const raw = doc.context.lookup(stream)
                if (!(raw instanceof PDFRawStream)) {
                    throw new Error("PDF content stream missing")
                }
                return Buffer.from(decodePDFRawStream(raw).decode()).toString(
                    "latin1"
                )
            })
        })
        .join("\n")
}

function hasText(operators: string, value: string): boolean {
    return operators
        .toLowerCase()
        .includes(Buffer.from(value, "latin1").toString("hex"))
}

describe("generateContractPdf", () => {
    it("produces an A4 PDF with all ten articles, dynamic data and a borrower signature field", async () => {
        const pdf = await generateContractPdf(
            bagadAssoTicketRecord(),
            equipments,
            today
        )
        expect(pdf.subarray(0, 4).toString()).toBe("%PDF")

        const doc = await PDFDocument.load(pdf)
        expect(doc.getPageCount()).toBeGreaterThanOrEqual(2)
        for (const page of doc.getPages()) {
            expect(page.getSize().width).toBeCloseTo(595.28)
            expect(
                page.node.Resources()?.lookup(PDFName.of("XObject"))
            ).toBeDefined()
        }
        const signature = doc.getForm().getSignature("signature_emprunteur")
        expect(signature.acroField.V()).toBeUndefined()
        const fieldPage = signature.acroField.getWidgets()[0].P()
        expect(fieldPage).toEqual(doc.getPage(doc.getPageCount() - 1).ref)

        const operators = pageTextOperators(doc)
        expect(operators).toContain(" 11 Tf")
        for (let article = 1; article <= 10; article++) {
            expect(hasText(operators, `Article ${article} :`)).toBe(true)
        }
        for (const value of [
            "Asso Test",
            "Lea Martin",
            "Gala annuel",
            "- 2 x Barnum",
            "- 1 x Projecteur",
            "125,00",
            "01/09/2026",
            "02/09/2026",
            "Colin OZANNE"
        ]) {
            expect(hasText(operators, value)).toBe(true)
        }
    })

    it("adds pages as needed for long equipment lists, keeping the signature on the final page", async () => {
        const pdf = await generateContractPdf(
            bagadAssoTicketRecord({ eventEndDate: null }),
            Array.from({ length: 65 }, (_, index) => ({
                id: index + 1,
                name: `Materiel ${index + 1} de grande taille avec accessoires`,
                quantity: 2,
                deposit: 30
            })),
            today
        )
        const doc = await PDFDocument.load(pdf)
        expect(doc.getPageCount()).toBeGreaterThanOrEqual(4)
        expect(doc.getForm().getSignature("signature_emprunteur")).toBeDefined()
        const operators = pageTextOperators(doc)
        expect(hasText(operators, "Materiel 65")).toBe(true)
        expect(hasText(operators, "Article 10 :")).toBe(true)
    })
})
