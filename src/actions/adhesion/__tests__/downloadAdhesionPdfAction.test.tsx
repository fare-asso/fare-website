import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAdhesionRecord } from "@/test/factories/adhesion"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    getUser: vi.fn(),
    genPdf: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ adhesion: { findUnique: h.findUnique } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/helpers/adhesion/generatePdf", () => ({
    generateAdhesionPdfFromRecord: h.genPdf
}))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { downloadAdhesionPdfAction } from "../downloadAdhesionPdfAction"

const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:adhesions"]))
    h.findUnique.mockResolvedValue(validAdhesionRecord())
    h.genPdf.mockResolvedValue(bytes)
})

describe("downloadAdhesionPdfAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findUnique).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("requires the access:adhesions permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await downloadAdhesionPdfAction(1)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.findUnique).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("errors when the adhesion does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            success: false,
            error: "Demande d'adhésion introuvable"
        })
        expect(h.genPdf).not.toHaveBeenCalled()
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
        h.findUnique.mockResolvedValue(
            validAdhesionRecord({ sigle: "", id: 42 })
        )
        const res = await downloadAdhesionPdfAction(42)
        if (!res.success) throw new Error("expected success")
        expect(res.filename).toBe("formulaire-adhesion-adhesion-42.pdf")
    })

    it("captures and returns an error when PDF generation throws", async () => {
        h.genPdf.mockRejectedValue(new Error("boom"))
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            success: false,
            error: "Erreur lors de la génération du PDF"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("captures and returns an error when the db lookup throws", async () => {
        h.findUnique.mockRejectedValue(new Error("db down"))
        expect(await downloadAdhesionPdfAction(1)).toEqual({
            success: false,
            error: "Erreur lors de la génération du PDF"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
