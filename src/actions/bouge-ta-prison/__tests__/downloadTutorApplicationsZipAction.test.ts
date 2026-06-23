import { unzipSync } from "fflate"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { validTutorApplicationRecord } from "@/test/factories/bougeTaPrison"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findMany: vi.fn(),
    getUser: vi.fn(),
    download: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ download: h.download })))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorApplication: { findMany: h.findMany } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import downloadTutorApplicationsZipAction from "../downloadTutorApplicationsZipAction"

const blob = (): Blob => new Blob([new Uint8Array([1, 2, 3])])

const unzip = (base64: string): Record<string, Uint8Array> =>
    unzipSync(new Uint8Array(Buffer.from(base64, "base64")))

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.download.mockResolvedValue({ data: blob(), error: null })
    h.findMany.mockResolvedValue([validTutorApplicationRecord()])
})

describe("downloadTutorApplicationsZipAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await downloadTutorApplicationsZipAction([1])).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await downloadTutorApplicationsZipAction([1])
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/permission/)
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("rejects an empty selection", async () => {
        const res = await downloadTutorApplicationsZipAction([])
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/invalide/i)
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("rejects a selection over the cap", async () => {
        const ids = Array.from({ length: 76 }, (_, i) => i + 1)
        const res = await downloadTutorApplicationsZipAction(ids)
        expect(res.success).toBe(false)
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("rejects non-integer ids", async () => {
        const res = await downloadTutorApplicationsZipAction([1.5])
        expect(res.success).toBe(false)
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("captures and errors when fetching applications fails", async () => {
        h.findMany.mockRejectedValue(new Error("db down"))
        expect(await downloadTutorApplicationsZipAction([1])).toEqual({
            success: false,
            error: "Erreur lors de la création du fichier zip"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.download).not.toHaveBeenCalled()
    })

    it("errors when no application matches the selection", async () => {
        h.findMany.mockResolvedValue([])
        expect(await downloadTutorApplicationsZipAction([1])).toEqual({
            success: false,
            error: "Aucune candidature ne correspond à la sélection"
        })
        expect(h.download).not.toHaveBeenCalled()
    })

    it("zips both files per candidate with a CSV manifest", async () => {
        const res = await downloadTutorApplicationsZipAction([1])
        expect(res.success).toBe(true)
        if (!res.success) return
        expect(res.missing).toBe(0)
        expect(res.filename).toMatch(
            /^candidatures-tutorat-\d{4}-\d{2}-\d{2}\.zip$/
        )
        expect(h.download).toHaveBeenCalledTimes(2)
        expect(h.download).toHaveBeenCalledWith("folder/cv.pdf")
        expect(h.download).toHaveBeenCalledWith("folder/lm.pdf")

        const files = unzip(res.zipData)
        expect(Object.keys(files).sort()).toEqual([
            "candidatures.csv",
            "martin-lea-1/cv.pdf",
            "martin-lea-1/lettre-de-motivation.pdf"
        ])
        const csv = new TextDecoder().decode(files["candidatures.csv"])
        expect(csv).toContain("Martin")
        expect(csv).toContain("lea@example.com")
    })

    it("skips missing files, still zips and reports the count", async () => {
        h.download.mockImplementation(async (path: string) =>
            path === "folder/cv.pdf"
                ? { data: null, error: { message: "gone" } }
                : { data: blob(), error: null }
        )
        const res = await downloadTutorApplicationsZipAction([1])
        expect(res.success).toBe(true)
        if (!res.success) return
        expect(res.missing).toBe(1)

        const files = unzip(res.zipData)
        expect(files["martin-lea-1/cv.pdf"]).toBeUndefined()
        expect(files["martin-lea-1/lettre-de-motivation.pdf"]).toBeDefined()
        const csv = new TextDecoder().decode(files["candidatures.csv"])
        expect(csv).toContain("cv.pdf")
    })
})
