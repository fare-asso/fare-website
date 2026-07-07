import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile, validAddInstance } from "@/test/factories/instances"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    createInstance: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db.server", () =>
    dbModule({ instance: { create: h.createInstance } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addInstanceAction from "../addInstanceAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:instance"]))
    h.createInstance.mockResolvedValue({ id: 1 })
    h.upload.mockResolvedValue({ data: { path: "uuid.png" }, error: null })
    h.remove.mockResolvedValue({ data: [], error: null })
})

describe("addInstanceAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addInstanceAction(validAddInstance())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.createInstance).not.toHaveBeenCalled()
    })

    it("requires the create:instance permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addInstanceAction(validAddInstance())
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.createInstance).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addInstanceAction(
            validAddInstance({ contactEmail: "nope" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.createInstance).not.toHaveBeenCalled()
    })

    it("creates the instance without logos on the happy path", async () => {
        const res = await addInstanceAction(validAddInstance())
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.createInstance).toHaveBeenCalledWith({
            data: {
                name: "Conseil Municipal",
                contactEmail: "contact@example.com",
                description: null,
                logoPaths: []
            }
        })
    })

    it("uploads logos and stores their paths", async () => {
        h.upload.mockResolvedValue({ data: { path: "a.png" }, error: null })
        const res = await addInstanceAction(
            validAddInstance({ logos: [imageFile()] })
        )
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        expect(h.createInstance).toHaveBeenCalledWith({
            data: expect.objectContaining({ logoPaths: ["a.png"] })
        })
    })

    it("cleans up successful uploads when one upload fails", async () => {
        h.upload
            .mockResolvedValueOnce({ data: { path: "a.png" }, error: null })
            .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
        const res = await addInstanceAction(
            validAddInstance({
                logos: [imageFile("a.png"), imageFile("b.png")]
            })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload des logos."
        })
        expect(h.remove).toHaveBeenCalledWith(["a.png"])
        expect(h.createInstance).not.toHaveBeenCalled()
    })

    it("removes uploaded logos when the insert fails", async () => {
        h.upload.mockResolvedValue({ data: { path: "a.png" }, error: null })
        h.createInstance.mockRejectedValue(new Error("insert failed"))
        const res = await addInstanceAction(
            validAddInstance({ logos: [imageFile()] })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de la création de l'instance."
        })
        expect(h.remove).toHaveBeenCalledWith(["a.png"])
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("fails without cleanup when the insert fails and there are no logos", async () => {
        h.createInstance.mockRejectedValue(new Error("insert failed"))
        const res = await addInstanceAction(validAddInstance())
        expect(res).toEqual({
            success: false,
            error: "Échec de la création de l'instance."
        })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
