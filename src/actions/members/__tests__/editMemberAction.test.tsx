import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import { validEditMember } from "@/test/factories/members"
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
    dbModule({ member: { findUnique: h.findUnique, update: h.update } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editMemberAction from "../editMemberAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:member"]))
    h.findUnique.mockResolvedValue({ picturePath: "old-uuid.png" })
    h.storageUpload.mockImplementation((path: string) =>
        Promise.resolve({ data: { path }, error: null })
    )
    h.storageRemove.mockResolvedValue({ data: [], error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editMemberAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await editMemberAction(validEditMember())
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editMemberAction(validEditMember())
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid id", async () => {
        const res = await editMemberAction(validEditMember({ id: 0 }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editMemberAction(validEditMember({ email: "nope" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("rejects a non-image picture", async () => {
        const res = await editMemberAction(
            validEditMember({ picture: pdfFile("x.pdf") })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findUnique).not.toHaveBeenCalled()
    })

    it("returns an error when the member does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await editMemberAction(validEditMember())
        expect(res).toEqual({
            success: false,
            error: "Membre introuvable."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("skips the storage upload when no picture is provided", async () => {
        const res = await editMemberAction(validEditMember())
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).not.toHaveBeenCalled()
        expect(h.storageRemove).not.toHaveBeenCalled()
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                picturePath: "old-uuid.png"
            })
        })
    })

    it("captures and fails when the storage upload throws", async () => {
        h.storageUpload.mockRejectedValue(new Error("storage down"))
        const res = await editMemberAction(
            validEditMember({ picture: imageFile("new.png") })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload de la photo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.storageRemove).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editMemberAction(validEditMember())
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification du membre."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("uploads a new picture, removes the old one and updates on the happy path", async () => {
        const picture = imageFile("new.png")
        const res = await editMemberAction(
            validEditMember({ id: 7, firstName: "Lou", picture })
        )
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).toHaveBeenCalledTimes(1)
        const [path, file, opts] = h.storageUpload.mock.calls[0]
        expect(path).toMatch(/^new-[0-9a-f]{8}\.png$/)
        expect(file).toBe(picture)
        expect(opts).toEqual({ contentType: picture.type })
        expect(h.storageRemove).toHaveBeenCalledWith(["old-uuid.png"])
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: expect.objectContaining({
                firstName: "Lou",
                picturePath: path
            })
        })
    })

    it("skips the remove when the previous picturePath is empty", async () => {
        h.findUnique.mockResolvedValue({ picturePath: "" })
        const res = await editMemberAction(
            validEditMember({ picture: imageFile("new.png") })
        )
        expect(res).toEqual({ success: true })
        expect(h.storageUpload).toHaveBeenCalledTimes(1)
        expect(h.storageRemove).not.toHaveBeenCalled()
    })
})
