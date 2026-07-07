import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import { validEditPartenaire } from "@/test/factories/partenaires"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    storageUpload: vi.fn(),
    storageRemove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.storageUpload, remove: h.storageRemove }))
)

vi.mock("@/helpers/db.server", () =>
    dbModule({
        partenaire: { findUnique: h.findUnique, update: h.update }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import type { TEditPartenaire } from "@/schemas/partenaires"

import { editPartenaireAction } from "../editPartenaireAction"

const fd = (input: TEditPartenaire): FormData => {
    const f = new FormData()
    f.set("id", String(input.id))
    f.set("name", input.name)
    f.set("description", input.description)
    if (input.logo) f.set("logo", input.logo)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:partner"]))
    h.findUnique.mockResolvedValue({ logoPath: "old-uuid.png" })
    h.storageUpload.mockImplementation((path: string) =>
        Promise.resolve({ data: { path }, error: null })
    )
    h.storageRemove.mockResolvedValue({ data: [], error: null })
    h.update.mockResolvedValue({
        id: 1,
        name: "ACME",
        description: "ok",
        logoPath: "old-uuid.png"
    })
})

describe("editPartenaireAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire())
        })
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:partner permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire())
        })
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid id", async () => {
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ id: 0 }))
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("rejects an empty name", async () => {
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ name: "" }))
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("rejects a description over 1000 characters", async () => {
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ description: "a".repeat(1001) }))
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("rejects a non-image logo", async () => {
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ logo: pdfFile("x.pdf") }))
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("returns an error when the partenaire does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire())
        })
        expect(res).toEqual({
            success: false,
            error: "Partenaire introuvable."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("skips the storage upload when no logo is provided", async () => {
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire())
        })
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).not.toHaveBeenCalled()
        expect(h.storageRemove).not.toHaveBeenCalled()
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: "ACME",
                description: "Un partenaire de la Federation.",
                logoPath: "old-uuid.png"
            }
        })
    })

    it("captures and fails when the storage upload throws", async () => {
        h.storageUpload.mockRejectedValue(new Error("storage down"))
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ logo: imageFile("new.png") }))
        })
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload du logo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.storageRemove).not.toHaveBeenCalled()
    })

    it("returns an error when the storage upload resolves with an error", async () => {
        h.storageUpload.mockResolvedValue({
            data: null,
            error: { message: "boom" }
        })
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ logo: imageFile("new.png") }))
        })
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload du logo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.storageRemove).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire())
        })
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification du partenaire."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("uploads a new logo, removes the old one and updates the partenaire on the happy path", async () => {
        const logo = imageFile("new.png")
        const res = await editPartenaireAction({
            data: fd(
                validEditPartenaire({
                    id: 7,
                    name: "New ACME",
                    description: "New description",
                    logo
                })
            )
        })
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).toHaveBeenCalledTimes(1)
        const [path, file, opts] = h.storageUpload.mock.calls[0]
        expect(typeof path).toBe("string")
        expect(path).toMatch(/\.png$/)
        expect(file).toBe(logo)
        expect(opts).toEqual({ contentType: logo.type })
        expect(h.storageRemove).toHaveBeenCalledWith(["old-uuid.png"])
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: {
                name: "New ACME",
                description: "New description",
                logoPath: path
            }
        })
    })

    it("skips the remove when the previous logoPath is empty", async () => {
        h.findUnique.mockResolvedValue({ logoPath: "" })
        const res = await editPartenaireAction({
            data: fd(validEditPartenaire({ logo: imageFile("new.png") }))
        })
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).toHaveBeenCalledTimes(1)
        expect(h.storageRemove).not.toHaveBeenCalled()
    })
})
