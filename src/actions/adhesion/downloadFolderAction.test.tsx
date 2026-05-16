import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockUser, validAdhesionRecord } from "@/test/factories"

const db = vi.hoisted(() => ({ findFirst: vi.fn() }))
const auth = vi.hoisted(() => ({ getCurrentUserWithPermissions: vi.fn() }))
const pdf = vi.hoisted(() => ({ generateAdhesionPdfFromRecord: vi.fn() }))
const sb = vi.hoisted(() => {
    const list = vi.fn()
    const download = vi.fn()
    const from = vi.fn(() => ({ list, download }))
    return { list, download, from }
})

vi.mock("@/helpers/db", () => ({
    default: { adhesion: { findFirst: db.findFirst } }
}))
vi.mock("@/helpers/supabase/auth", () => ({
    getCurrentUserWithPermissions: auth.getCurrentUserWithPermissions
}))
vi.mock("@/helpers/supabase/server", () => ({
    createClient: vi.fn(async () => ({ storage: { from: sb.from } }))
}))
vi.mock("@/helpers/adhesion/generatePdf", () => ({
    generateAdhesionPdfFromRecord: pdf.generateAdhesionPdfFromRecord
}))

import { downloadFolderAction } from "./downloadFolderAction"

const isZip = (b64: string): boolean => {
    const buf = Buffer.from(b64, "base64")
    return buf.length > 0 && buf[0] === 0x50 && buf[1] === 0x4b
}

beforeEach(() => {
    auth.getCurrentUserWithPermissions.mockResolvedValue(
        mockUser(["access:adhesions"])
    )
    sb.list.mockResolvedValue({
        data: [{ name: "logo.png" }, { name: "statuts.pdf" }],
        error: null
    })
    sb.download.mockResolvedValue({
        data: new Blob([new Uint8Array([1, 2, 3])]),
        error: null
    })
    db.findFirst.mockResolvedValue(validAdhesionRecord())
    pdf.generateAdhesionPdfFromRecord.mockResolvedValue(
        new Uint8Array([0x25, 0x50, 0x44, 0x46])
    )
})

describe("downloadFolderAction", () => {
    it("requires authentication", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(null)
        expect(await downloadFolderAction(undefined, "f")).toEqual({
            error: "Authentification requise"
        })
    })

    it("requires the access:adhesions permission", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(mockUser([]))
        const res = await downloadFolderAction(undefined, "f")
        expect(res.error).toMatch(/permission/)
    })

    it("rejects an empty folder path", async () => {
        expect(await downloadFolderAction(undefined, "")).toEqual({
            error: "Le nom du dossier est invalide"
        })
    })

    it("returns an error when listing the folder fails", async () => {
        sb.list.mockResolvedValue({
            data: null,
            error: { message: "nope" }
        })
        expect(await downloadFolderAction(undefined, "uuid-fare")).toEqual({
            error: "Erreur lors de la création du fichier zip"
        })
    })

    it("zips the folder and appends the generated PDF", async () => {
        const res = await downloadFolderAction(undefined, "uuid-fare")
        expect(res.success).toBe(true)
        expect(res.filename).toBe("uuid-fare.zip")
        expect(res.zipData && isZip(res.zipData)).toBe(true)
        expect(pdf.generateAdhesionPdfFromRecord).toHaveBeenCalledOnce()
    })

    it("still zips when no adhesion matches the folder", async () => {
        db.findFirst.mockResolvedValue(null)
        const res = await downloadFolderAction(undefined, "uuid-fare")
        expect(res.success).toBe(true)
        expect(res.zipData && isZip(res.zipData)).toBe(true)
        expect(pdf.generateAdhesionPdfFromRecord).not.toHaveBeenCalled()
    })
})
