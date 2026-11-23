import { PDFDocument } from "pdf-lib"
import { describe, expect, it } from "vitest"

import { validRemboursementRecord } from "@/test/factories/remboursement"

import { generateRemboursementPdfFromRecord } from "../generatePdf"

const isPdf = (bytes: Uint8Array): boolean =>
    bytes.length > 0 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46

describe("generateRemboursementPdfFromRecord", () => {
    it("produces a non-empty A4 PDF document for a train request", async () => {
        const pdf = await generateRemboursementPdfFromRecord(
            validRemboursementRecord()
        )
        expect(isPdf(pdf)).toBe(true)
        const doc = await PDFDocument.load(pdf)
        expect(doc.getPageCount()).toBe(1)
        expect(doc.getPage(0).getWidth()).toBeCloseTo(595.28)
        expect(doc.getPage(0).getHeight()).toBeCloseTo(841.89)
    })

    it("renders voiture and achat records including non-ASCII characters safely", async () => {
        const voiturePdf = await generateRemboursementPdfFromRecord(
            validRemboursementRecord({
                demandeur: "equipeTerritoriale",
                association: null,
                type: "voiture",
                personnes: "Marie Durand (BDE) → Jean Dupont (FARE)…",
                piecesMetroBusPaths: ["f/metro-bus-1.png"],
                justificatifsPassagersPaths: ["f/passagers-1.png"],
                archived: new Date("2026-11-24T00:00:00.000Z")
            })
        )
        expect(isPdf(voiturePdf)).toBe(true)

        const achatPdf = await generateRemboursementPdfFromRecord(
            validRemboursementRecord({
                demandeur: "bureauTerritorial",
                association: null,
                type: "achat",
                dateVoyage: null,
                depart: null,
                arrivee: null,
                objet: "Impression d'affiches",
                montantTTC: "12,50"
            })
        )
        expect(isPdf(achatPdf)).toBe(true)
    })
})
