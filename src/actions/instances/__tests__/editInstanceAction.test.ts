import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile, validEditInstance } from "@/test/factories/instances"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findInstance: vi.fn(),
    updateInstance: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db", () =>
    dbModule({
        instance: { findUnique: h.findInstance, update: h.updateInstance }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editInstanceAction from "../editInstanceAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:instance"]))
    h.findInstance.mockResolvedValue({ logoPaths: ["old.png"] })
    h.updateInstance.mockResolvedValue({ id: 1 })
    h.upload.mockResolvedValue({ data: { path: "new.png" }, error: null })
    h.remove.mockResolvedValue({ data: [], error: null })
})

describe("editInstanceAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editInstanceAction(validEditInstance())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateInstance).not.toHaveBeenCalled()
    })

    it("requires the edit:instance permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editInstanceAction(validEditInstance())
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateInstance).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editInstanceAction(
            validEditInstance({ contactEmail: "nope" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findInstance).not.toHaveBeenCalled()
    })

    it("returns an error when the instance is not found", async () => {
        h.findInstance.mockResolvedValue(null)
        const res = await editInstanceAction(validEditInstance())
        expect(res).toEqual({ success: false, error: "Instance introuvable." })
        expect(h.updateInstance).not.toHaveBeenCalled()
    })

    it("captures and fails when the lookup throws", async () => {
        h.findInstance.mockRejectedValue(new Error("db down"))
        const res = await editInstanceAction(validEditInstance())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.updateInstance).not.toHaveBeenCalled()
    })

    it("keeps the existing logos when no new ones are uploaded", async () => {
        const res = await editInstanceAction(validEditInstance())
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.updateInstance).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: "Conseil Municipal",
                contactEmail: "contact@example.com",
                description: null,
                logoPaths: ["old.png"]
            }
        })
    })

    it("removes the old logos only after a successful update", async () => {
        const res = await editInstanceAction(
            validEditInstance({ logos: [imageFile()] })
        )
        expect(res).toEqual({ success: true })
        expect(h.updateInstance).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({ logoPaths: ["new.png"] })
        })
        // old set removed, and only after the DB update succeeded
        expect(h.remove).toHaveBeenCalledWith(["old.png"])
        expect(h.updateInstance.mock.invocationCallOrder[0]).toBeLessThan(
            h.remove.mock.invocationCallOrder[0]
        )
    })

    it("preserves the old logos and cleans up new ones when the update fails", async () => {
        h.updateInstance.mockRejectedValue(new Error("update failed"))
        const res = await editInstanceAction(
            validEditInstance({ logos: [imageFile()] })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification de l'instance."
        })
        // orphaned new upload cleaned up, old logos NOT touched
        expect(h.remove).toHaveBeenCalledWith(["new.png"])
        expect(h.remove).not.toHaveBeenCalledWith(["old.png"])
        expect(h.captureActionError).toHaveBeenCalled()
    })

    it("does not remove anything when the update fails without new logos", async () => {
        h.updateInstance.mockRejectedValue(new Error("update failed"))
        const res = await editInstanceAction(validEditInstance())
        expect(res.success).toBe(false)
        expect(h.remove).not.toHaveBeenCalled()
    })

    it("cleans up partial uploads and skips the update", async () => {
        h.upload
            .mockResolvedValueOnce({ data: { path: "a.png" }, error: null })
            .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
        const res = await editInstanceAction(
            validEditInstance({
                logos: [imageFile("a.png"), imageFile("b.png")]
            })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload des logos."
        })
        expect(h.remove).toHaveBeenCalledWith(["a.png"])
        expect(h.updateInstance).not.toHaveBeenCalled()
    })
})
