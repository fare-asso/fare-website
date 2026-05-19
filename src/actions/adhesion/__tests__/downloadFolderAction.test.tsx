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
    list: vi.fn(),
    download: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ list: h.list, download: h.download }))
)

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
    h.list.mockResolvedValue({
        data: [{ name: "logo.png" }, { name: "statuts.pdf" }],
        error: null
    })
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
        expect(await downloadFolderAction(undefined, "f")).toEqual({
            error: "Authentification requise"
        })
        expect(h.list).not.toHaveBeenCalled()
    })

    it("requires the access:adhesions permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await downloadFolderAction(undefined, "f")
        expect(res.error).toMatch(/permission/)
        expect(h.list).not.toHaveBeenCalled()
    })

    it("rejects an empty folder path", async () => {
        expect(await downloadFolderAction(undefined, "")).toEqual({
            error: "Le nom du dossier est invalide"
        })
    })

    it("captures and errors when listing the folder fails", async () => {
        h.list.mockResolvedValue({ data: null, error: { message: "nope" } })
        expect(await downloadFolderAction(undefined, "uuid-fare")).toEqual({
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("captures and errors when a file download fails", async () => {
        h.download.mockResolvedValue({
            data: null,
            error: { message: "gone" }
        })
        expect(await downloadFolderAction(undefined, "uuid-fare")).toEqual({
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("zips the folder and appends the generated PDF", async () => {
        const res = await downloadFolderAction(undefined, "uuid-fare")
        expect(res.success).toBe(true)
        expect(res.filename).toBe("uuid-fare.zip")
        expect(res.zipData && isZip(res.zipData)).toBe(true)
        expect(h.genPdf).toHaveBeenCalledOnce()
    })

    it("still zips when no adhesion matches the folder", async () => {
        h.findFirst.mockResolvedValue(null)
        const res = await downloadFolderAction(undefined, "uuid-fare")
        expect(res.success).toBe(true)
        expect(res.zipData && isZip(res.zipData)).toBe(true)
        expect(h.genPdf).not.toHaveBeenCalled()
    })
})
