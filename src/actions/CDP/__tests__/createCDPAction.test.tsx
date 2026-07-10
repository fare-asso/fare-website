import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db", () =>
    dbModule({ communiqueDePresse: { create: h.create } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { createCDPAction } from "../createCDPAction"

function pdfFile(type = "application/pdf"): File {
    return new File(["%PDF-1.4 content"], "doc.pdf", { type })
}

function fd(
    overrides: { name?: string; type?: string; file?: File | null } = {}
): FormData {
    const f = new FormData()
    if (overrides.name !== "") f.set("name", overrides.name ?? "Communiqué")
    f.set("CDPType", overrides.type ?? "CDP")
    f.set("date", "2026-01-01")
    if (overrides.file !== null) f.set("CDPfile", overrides.file ?? pdfFile())
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:cdp"]))
    h.upload.mockResolvedValue({ path: "communique.pdf" })
    h.create.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("createCDPAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await createCDPAction(fd())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:cdp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await createCDPAction(fd())
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/permission/)
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        expect(await createCDPAction(fd({ name: "" }))).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("rejects a non-PDF file", async () => {
        expect(
            await createCDPAction(fd({ file: pdfFile("text/plain") }))
        ).toEqual({
            success: false,
            error: "Le fichier doit être de format PDF"
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("captures, removes the file and fails when the insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        expect(await createCDPAction(fd())).toEqual({
            success: false,
            error: "Echec de l'ajout du CDP dans la base de données"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["communique.pdf"])
    })

    it("uploads the file and creates the CDP on the happy path", async () => {
        const res = await createCDPAction(fd())
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
