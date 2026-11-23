import { beforeEach, describe, expect, it, vi } from "vitest"

import { validRemboursementRecord } from "@/test/factories/remboursement"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    getUser: vi.fn(),
    genPdf: vi.fn(),
    download: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ download: h.download })))

vi.mock("@/helpers/db", () =>
    dbModule({ remboursement: { findUnique: h.findUnique } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/helpers/remboursement/generatePdf", () => ({
    generateRemboursementPdfFromRecord: h.genPdf
}))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { downloadRemboursementFolderAction } from "../downloadRemboursementFolderAction"

const isZip = (b64: string): boolean => {
    const buf = Buffer.from(b64, "base64")
    return buf.length > 0 && buf[0] === 0x50 && buf[1] === 0x4b
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["download:remboursement-folder"]))
    h.download.mockResolvedValue({
        data: new Blob([new Uint8Array([1, 2, 3])]),
        error: null
    })
    h.findUnique.mockResolvedValue(validRemboursementRecord())
    h.genPdf.mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
})

describe("downloadRemboursementFolderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("requires the download:remboursement-folder permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("captures and errors when fetching the record fails", async () => {
        h.findUnique.mockRejectedValue(new Error("db down"))
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.download).not.toHaveBeenCalled()
    })

    it("errors when no record matches the id", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: "Aucune demande de remboursement ne correspond à cet identifiant"
        })
        expect(h.download).not.toHaveBeenCalled()
        expect(h.genPdf).not.toHaveBeenCalled()
    })

    it("captures and errors when a file download fails", async () => {
        h.download.mockResolvedValue({
            data: null,
            error: { message: "gone" }
        })
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("captures and errors when PDF generation fails", async () => {
        h.genPdf.mockRejectedValueOnce(new Error("pdf failed"))
        expect(await downloadRemboursementFolderAction(1)).toEqual({
            success: false,
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("downloads the RIB and justificatifs, appends the PDF, and returns a base64 zip", async () => {
        h.findUnique.mockResolvedValue(
            validRemboursementRecord({
                piecesMetroBusPaths: ["marie-durand-uuid/metro-bus-1.png"],
                justificatifsPassagersPaths: [
                    "marie-durand-uuid/passagers-1.png"
                ]
            })
        )
        const res = await downloadRemboursementFolderAction(1)
        if (!res.success) throw new Error(res.error)
        expect(res.filename).toBe("marie-durand-uuid.zip")
        expect(isZip(res.zipData)).toBe(true)
        expect(from).toHaveBeenCalledWith("remboursement")
        expect(h.download).toHaveBeenCalledTimes(4)
        expect(h.download).toHaveBeenCalledWith("marie-durand-uuid/rib.pdf")
        expect(h.download).toHaveBeenCalledWith(
            "marie-durand-uuid/justificatif-1.pdf"
        )
        expect(h.genPdf).toHaveBeenCalledOnce()
    })
})
