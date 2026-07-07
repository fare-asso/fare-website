import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAdhesionRecord } from "@/test/factories/adhesion"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findFirst: vi.fn(),
    getUser: vi.fn(),
    genPdf: vi.fn(),
    download: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ download: h.download })))

vi.mock("@/helpers/db", () =>
    dbModule({ adhesion: { findFirst: h.findFirst } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/helpers/adhesion/generatePdf", () => ({
    generateAdhesionPdfFromRecord: h.genPdf
}))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { downloadFolderAction } from "../downloadFolderAction"

const isZip = (b64: string): boolean => {
    const buf = Buffer.from(b64, "base64")
    return buf.length > 0 && buf[0] === 0x50 && buf[1] === 0x4b
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:adhesions"]))
    h.download.mockResolvedValue({
        data: new Blob([new Uint8Array([1, 2, 3])]),
        error: null
    })
    h.findFirst.mockResolvedValue(validAdhesionRecord())
    h.genPdf.mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
})

describe("downloadFolderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await downloadFolderAction("f")).toEqual({
            error: "Authentification requise"
        })
        expect(h.findFirst).not.toHaveBeenCalled()
    })

    it("requires the access:adhesions permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await downloadFolderAction("f")
        expect(res.error).toMatch(/permission/)
        expect(h.findFirst).not.toHaveBeenCalled()
    })

    it("rejects an empty folder path", async () => {
        expect(await downloadFolderAction("")).toEqual({
            error: "Le nom du dossier est invalide"
        })
    })

    it("captures and errors when fetching the adhesion fails", async () => {
        h.findFirst.mockRejectedValue(new Error("db down"))
        expect(await downloadFolderAction("uuid-fare")).toEqual({
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.download).not.toHaveBeenCalled()
    })

    it("captures and errors when a file download fails", async () => {
        h.download.mockResolvedValue({
            data: null,
            error: { message: "gone" }
        })
        expect(await downloadFolderAction("uuid-fare")).toEqual({
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("downloads the files referenced in the db and appends the PDF", async () => {
        const res = await downloadFolderAction("uuid-fare")
        expect(res.success).toBe(true)
        expect(res.filename).toBe("uuid-fare.zip")
        expect(res.zipData && isZip(res.zipData)).toBe(true)
        // 4 required paths in the factory record (optionals are null)
        expect(h.download).toHaveBeenCalledTimes(4)
        expect(h.download).toHaveBeenCalledWith("uuid-fare/logo.png")
        expect(h.genPdf).toHaveBeenCalledOnce()
    })

    it("errors when no adhesion matches the folder", async () => {
        h.findFirst.mockResolvedValue(null)
        expect(await downloadFolderAction("uuid-fare")).toEqual({
            error: "Aucune adhésion ne correspond à ce dossier"
        })
        expect(h.download).not.toHaveBeenCalled()
        expect(h.genPdf).not.toHaveBeenCalled()
    })
})
