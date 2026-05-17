import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockUser, validAdhesionRecord } from "@/test/factories"

const db = vi.hoisted(() => ({ findUnique: vi.fn() }))
const auth = vi.hoisted(() => ({ getCurrentUserWithPermissions: vi.fn() }))
const pdf = vi.hoisted(() => ({ generateAdhesionPdfFromRecord: vi.fn() }))

vi.mock("@/helpers/db", () => ({
    default: { adhesion: { findUnique: db.findUnique } }
}))
vi.mock("@/helpers/supabase/auth", () => ({
    getCurrentUserWithPermissions: auth.getCurrentUserWithPermissions
}))
vi.mock("@/helpers/adhesion/generatePdf", () => ({
    generateAdhesionPdfFromRecord: pdf.generateAdhesionPdfFromRecord
}))

import downloadAdhesionPdfAction from "../downloadAdhesionPdfAction"

const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])

beforeEach(() => {
    auth.getCurrentUserWithPermissions.mockResolvedValue(
        mockUser(["access:adhesions"])
    )
    db.findUnique.mockResolvedValue(validAdhesionRecord())
    pdf.generateAdhesionPdfFromRecord.mockResolvedValue(bytes)
})

describe("downloadAdhesionPdfAction", () => {
    it("requires authentication", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(null)
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            error: "Authentification requise"
        })
    })

    it("requires the access:adhesions permission", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(mockUser([]))
        const res = await downloadAdhesionPdfAction(1)
        expect(res.error).toMatch(/permission/)
    })

    it("errors when the adhesion does not exist", async () => {
        db.findUnique.mockResolvedValue(null)
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            error: "Demande d'adhésion introuvable"
        })
    })

    it("returns the base64 PDF and a sigle-based filename", async () => {
        const res = await downloadAdhesionPdfAction(1)
        expect(res).toEqual({
            success: true,
            pdfData: Buffer.from(bytes).toString("base64"),
            filename: "formulaire-adhesion-fare.pdf"
        })
    })

    it("falls back to an id-based slug when sigle is empty", async () => {
        db.findUnique.mockResolvedValue(
            validAdhesionRecord({ sigle: "", id: 42 })
        )
        const res = await downloadAdhesionPdfAction(42)
        expect(res.filename).toBe("formulaire-adhesion-adhesion-42.pdf")
    })

    it("returns an error when PDF generation throws", async () => {
        pdf.generateAdhesionPdfFromRecord.mockRejectedValue(new Error("x"))
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            error: "Erreur lors de la génération du PDF"
        })
    })
})
