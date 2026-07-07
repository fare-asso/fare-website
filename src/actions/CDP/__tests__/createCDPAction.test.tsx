import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    info: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ info: h.info, remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({ communiqueDePresse: { create: h.create } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import createCDPAction from "../createCDPAction"

const fd = (o: Record<string, string> = {}): FormData => {
    const f = new FormData()
    f.set("name", "Communiqué")
    f.set("CDPfilePath", "communique-de-presse/file.pdf")
    f.set("date", "2026-03-01")
    f.set("CDPType", "CDP")
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:cdp"]))
    h.info.mockResolvedValue({
        data: { size: 1024, contentType: "application/pdf" },
        error: null
    })
    h.remove.mockResolvedValue({ error: null })
    h.create.mockResolvedValue({ id: 1 })
})

describe("createCDPAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await createCDPAction(undefined, fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:cdp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await createCDPAction(undefined, fd())
        expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await createCDPAction(undefined, fd({ name: "" }))
        expect(res).toEqual({ error: "Un ou plusieurs champs sont invalides" })
    })

    it("errors when the file info cannot be fetched", async () => {
        h.info.mockResolvedValue({ data: null, error: { message: "gone" } })
        const res = await createCDPAction(undefined, fd())
        expect(res.error).toMatch(/récupération du fichier/)
    })

    it("rejects a non-PDF file", async () => {
        h.info.mockResolvedValue({
            data: { size: 1024, contentType: "image/png" },
            error: null
        })
        const res = await createCDPAction(undefined, fd())
        expect(res).toEqual({ error: "Le fichier doit être de format PDF" })
    })

    it("captures, removes the file and fails when the insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await createCDPAction(undefined, fd())
        expect(res).toEqual({
            error: "Echec de l'ajout du CDP dans la base de données"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["communique-de-presse/file.pdf"])
    })

    it("creates the CDP and revalidates on the happy path", async () => {
        const res = await createCDPAction(undefined, fd())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: "Communiqué",
                filePath: "communique-de-presse/file.pdf",
                size: 1024,
                type: "CDP"
            })
        })
    })
})
