import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import { validAddMember } from "@/test/factories/members"
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

vi.mock("@/helpers/db", () => dbModule({ member: { create: h.create } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { addMemberAction } from "../addMemberAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:member"]))
    h.upload.mockResolvedValue({
        data: { path: "uuid-lea.png" },
        error: null
    })
    h.create.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("addMemberAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await addMemberAction(validAddMember())
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addMemberAction(validAddMember())
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addMemberAction(
            validAddMember({ email: "not-an-email" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a non-image picture", async () => {
        const res = await addMemberAction(
            validAddMember({ picture: pdfFile("x.pdf") })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("captures and returns an error when the upload throws", async () => {
        h.upload.mockRejectedValue(new Error("storage down"))
        const res = await addMemberAction(validAddMember())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload de la photo."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("removes the uploaded picture when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addMemberAction(validAddMember())
        expect(res).toEqual({
            success: false,
            error: "Échec de la création du membre."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["uuid-lea.png"])
    })

    it("creates the member on the happy path", async () => {
        const input = validAddMember({ picture: imageFile("lea.png") })
        const res = await addMemberAction(input)
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        const [uploadName, uploadFile, uploadOpts] = h.upload.mock.calls[0] as [
            string,
            File,
            { contentType: string }
        ]
        expect(uploadName).toMatch(/^lea-[0-9a-f]{8}\.png$/)
        expect(uploadFile).toBe(input.picture)
        expect(uploadOpts).toEqual({ contentType: input.picture.type })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                position: "Tresoriere",
                picturePath: "uuid-lea.png",
                email: "lea@example.com",
                facebookUrl: null,
                instagramUrl: null,
                twitterUrl: null
            })
        })
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
