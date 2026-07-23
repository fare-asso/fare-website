import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationFormData } from "@/test/factories/associations"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db", () =>
    dbModule({
        association: { findUnique: h.findUnique, update: h.update }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { editAssociationAction } from "../editAssociationAction"

const fd = (o: Record<string, string | File> = {}): FormData =>
    validAssociationFormData({ id: "1", ...o })

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:association"]))
    h.findUnique.mockResolvedValue({
        logoPath: "association-pictures/old.png",
        officePath: null
    })
    h.upload.mockResolvedValue({
        data: { path: "association-pictures/new.png" },
        error: null
    })
    h.remove.mockResolvedValue({ data: null, error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editAssociationAction(fd())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editAssociationAction(fd())
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when the current association cannot be fetched", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await editAssociationAction(fd())
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/récupération des informations/)
        })
    })

    it("captures and fails when the fetch throws", async () => {
        h.findUnique.mockRejectedValue(new Error("db down"))
        const res = await editAssociationAction(fd())
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/récupération des informations/)
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a non-numeric id", async () => {
        const res = await editAssociationAction(fd({ id: "abc" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await editAssociationAction(fd({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid social link server-side", async () => {
        const res = await editAssociationAction(fd({ website: "pas-une-url" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid birthdate server-side", async () => {
        const res = await editAssociationAction(
            fd({ birthdate: "pas-une-date" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a non-file logo", async () => {
        const res = await editAssociationAction(fd({ "logo-picture": "nope" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
    })

    it("rejects an oversized logo", async () => {
        const big = new File([new Uint8Array(16 * 1024 * 1024)], "big.png", {
            type: "image/png"
        })
        const res = await editAssociationAction(fd({ "logo-picture": big }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("returns a generic error when the logo upload fails", async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: { message: "upload boom" }
        })
        const res = await editAssociationAction(fd())
        expect(res).toEqual({
            success: false,
            error: "Echec de la mise à jour du logo"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures, cleans up the new logo and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editAssociationAction(fd())
        expect(res).toEqual({
            success: false,
            error: "Echec de la modification de l'association"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["association-pictures/new.png"])
    })

    it("keeps the current logo when no new file is provided", async () => {
        const data = fd()
        data.delete("logo-picture")
        const res = await editAssociationAction(data)
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                logoPath: "association-pictures/old.png"
            })
        })
    })

    it("updates the association and removes the old logo on the happy path", async () => {
        const res = await editAssociationAction(fd())
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                name: "Asso Test",
                logoPath: "association-pictures/new.png"
            })
        })
        expect(h.remove).toHaveBeenCalledWith(["association-pictures/old.png"])
    })
})
