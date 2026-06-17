import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEditEquipmentInput } from "@/test/factories/bagadAsso"
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
    findUnique: vi.fn(),
    update: vi.fn(),
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
    dbModule({
        bagadAssoEquipment: { findUnique: h.findUnique, update: h.update }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editEquipmentAction from "../editEquipmentAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-equipment"]))
    h.findUnique.mockResolvedValue({ imagePath: "old.png" })
    h.upload.mockResolvedValue({ path: "new.png" })
    h.remove.mockResolvedValue({ error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editEquipmentAction(validEditEquipmentInput())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:bagad-equipment permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editEquipmentAction(validEditEquipmentInput())
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editEquipmentAction(
            validEditEquipmentInput({ name: "" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when the equipment does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await editEquipmentAction(validEditEquipmentInput())).toEqual({
            success: false,
            error: "Équipement non trouvé."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editEquipmentAction(validEditEquipmentInput())
        expect(res).toEqual({
            success: false,
            error: "Echec de la modification de l'équipement. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("keeps the current image when none is provided", async () => {
        const res = await editEquipmentAction(validEditEquipmentInput())
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: "Barnum",
                deposit: 50,
                quantity: 2,
                imagePath: "old.png"
            }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/bagadAsso")
        expect(h.revalidatePath).toHaveBeenCalledWith("/projets/bagad-asso")
    })

    it("uploads a new image and removes the old one on replace", async () => {
        const res = await editEquipmentAction(
            validEditEquipmentInput({ image: imageFile("tent.png") })
        )
        expect(res).toEqual({ success: true })
        expect(h.upload).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["old.png"])
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({ imagePath: "new.png" })
        })
    })

    it("removes the current image when removeImage is set", async () => {
        const res = await editEquipmentAction(
            validEditEquipmentInput({ removeImage: true })
        )
        expect(res).toEqual({ success: true })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.remove).toHaveBeenCalledWith(["old.png"])
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({ imagePath: null })
        })
    })
})
