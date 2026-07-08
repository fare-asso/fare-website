import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationFormData } from "@/test/factories/associations"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ upload: h.upload })))

vi.mock("@/helpers/db", () => dbModule({ association: { create: h.create } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { addAssociationAction } from "../addAssociationAction"

const bigImage = (): File =>
    new File([new Uint8Array(16 * 1024 * 1024)], "big.png", {
        type: "image/png"
    })

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:association"]))
    h.upload.mockResolvedValue({ data: { path: "logo-path" }, error: null })
    h.create.mockResolvedValue({ id: 1 })
})

describe("addAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addAssociationAction(validAssociationFormData())).toEqual({
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addAssociationAction(validAssociationFormData())
        expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await addAssociationAction(
            validAssociationFormData({ name: "" })
        )
        expect(res).toEqual({
            error: "Veuillez remplir tous les champs obligatoires."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("rejects a non-file logo", async () => {
        const res = await addAssociationAction(
            validAssociationFormData({ "logo-picture": "not-a-file" })
        )
        expect(res).toEqual({ error: "Logo non-valide." })
    })

    it("rejects an oversized logo", async () => {
        const res = await addAssociationAction(
            validAssociationFormData({ "logo-picture": bigImage() })
        )
        expect(res.error).toMatch(/taille/)
    })

    it("rejects an unsupported image type", async () => {
        const res = await addAssociationAction(
            validAssociationFormData({
                "logo-picture": new File([new Uint8Array([1])], "f.txt", {
                    type: "text/plain"
                })
            })
        )
        expect(res.error).toMatch(/format de l'image/)
    })

    it("returns the storage error when the upload fails", async () => {
        h.upload.mockResolvedValue({
            data: null,
            error: { message: "upload boom" }
        })
        const res = await addAssociationAction(validAssociationFormData())
        expect(res).toEqual({ error: "upload boom" })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addAssociationAction(validAssociationFormData())
        expect(res).toEqual({ error: "db down" })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the association on the happy path", async () => {
        const res = await addAssociationAction(validAssociationFormData())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: "Asso Test",
                major: "Informatique",
                desc: "Une association de test",
                logoPath: "logo-path",
                email: "asso@example.com"
            })
        })
    })
})
