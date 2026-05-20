import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile } from "@/test/factories/files"
import { validAddPartenaire } from "@/test/factories/partenaires"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    cacheModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db", () => dbModule({ partenaire: { create: h.create } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addPartenaireAction from "../addPartenaireAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:partner"]))
    h.upload.mockResolvedValue({
        data: { path: "uuid-logo.png" },
        error: null
    })
    h.create.mockResolvedValue({
        id: 1,
        name: "ACME",
        description: "ok",
        logoPath: "uuid-logo.png"
    })
    h.remove.mockResolvedValue({ error: null })
})

describe("addPartenaireAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await addPartenaireAction(validAddPartenaire())
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:partner permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addPartenaireAction(validAddPartenaire())
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload (empty name)", async () => {
        const res = await addPartenaireAction(validAddPartenaire({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a non-image logo", async () => {
        const res = await addPartenaireAction(
            validAddPartenaire({
                logo: new File([new Uint8Array([1])], "x.pdf", {
                    type: "application/pdf"
                })
            })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("captures and returns an error when the upload throws", async () => {
        h.upload.mockRejectedValue(new Error("storage down"))
        const res = await addPartenaireAction(validAddPartenaire())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload du logo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("returns an error when the upload resolves with a supabase error", async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: { message: "boom" }
        })
        const res = await addPartenaireAction(validAddPartenaire())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload du logo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("removes the uploaded logo when the db insert throws", async () => {
        h.upload.mockResolvedValue({
            data: { path: "uuid-logo.png" },
            error: null
        })
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addPartenaireAction(validAddPartenaire())
        expect(res).toEqual({
            success: false,
            error: "Échec de la création du partenaire."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["uuid-logo.png"])
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })

    it("creates the partenaire and revalidates on the happy path", async () => {
        const input = validAddPartenaire({
            name: "ACME",
            description: "Description du partenaire.",
            logo: imageFile("logo.png")
        })
        const res = await addPartenaireAction(input)
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        const [uploadName, uploadFile] = h.upload.mock.calls[0] as [
            string,
            File
        ]
        expect(typeof uploadName).toBe("string")
        expect(uploadName.length).toBeGreaterThan(0)
        expect(uploadFile).toBe(input.logo)
        expect(h.create).toHaveBeenCalledWith({
            data: {
                name: "ACME",
                description: "Description du partenaire.",
                logoPath: "uuid-logo.png"
            }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/partenaires")
        expect(h.revalidatePath).toHaveBeenCalledWith("/a-propos/partenaires")
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
