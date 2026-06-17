import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEquipmentInput } from "@/test/factories/bagadAsso"
import { imageFile } from "@/test/factories/files"
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

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoEquipment: { create: h.create } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addEquipmentAction from "../addEquipmentAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:bagad-equipment"]))
    h.upload.mockResolvedValue({ path: "equip.png" })
    h.create.mockResolvedValue({ id: 1 })
})

describe("addEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addEquipmentAction(validEquipmentInput())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:bagad-equipment permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addEquipmentAction(validEquipmentInput())
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addEquipmentAction(validEquipmentInput({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an unsupported image type", async () => {
        const res = await addEquipmentAction(
            validEquipmentInput({
                image: new File([new Uint8Array([1])], "f.txt", {
                    type: "text/plain"
                })
            })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("captures and fails when the upload throws", async () => {
        h.upload.mockRejectedValue(new Error("boom"))
        const res = await addEquipmentAction(
            validEquipmentInput({ image: imageFile("tent.png") })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de l'upload de l'image."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("cleans up the image and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addEquipmentAction(
            validEquipmentInput({ image: imageFile("tent.png") })
        )
        expect(res).toEqual({
            success: false,
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["equip.png"])
    })

    it("creates the equipment without an image", async () => {
        const res = await addEquipmentAction(validEquipmentInput())
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).toHaveBeenCalledWith({
            data: { name: "Barnum", deposit: 50, quantity: 2, imagePath: null }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/bagadAsso")
        expect(h.revalidatePath).toHaveBeenCalledWith("/projets/bagad-asso")
    })

    it("uploads the image and stores its path on the happy path", async () => {
        const res = await addEquipmentAction(
            validEquipmentInput({ image: imageFile("tent.png") })
        )
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ imagePath: "equip.png" })
        })
    })
})
