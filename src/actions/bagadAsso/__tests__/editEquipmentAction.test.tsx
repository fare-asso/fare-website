import { beforeEach, describe, expect, it, vi } from "vitest"
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

const fd = (o: Record<string, string | File> = {}): FormData => {
    const f = new FormData()
    f.set("equipmentId", "1")
    f.set("name", "Tente")
    f.set("quantity", "5")
    f.set("guarantee", "100")
    f.set("equipment-picture", imageFile("tent.png"))
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-equipment"]))
    h.findUnique.mockResolvedValue({ id: 1, imagePath: "old.png" })
    h.upload.mockResolvedValue({ data: { path: "new.png" }, error: null })
    h.remove.mockResolvedValue({ error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editEquipmentAction(undefined, fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:bagad-equipment permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editEquipmentAction(undefined, fd())
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await editEquipmentAction(undefined, fd({ name: "" }))
        expect(res).toEqual({
            error: "Un ou plusieurs champs ne sont pas remplis."
        })
    })

    it("rejects a non-numeric id", async () => {
        const res = await editEquipmentAction(
            undefined,
            fd({ equipmentId: "abc" })
        )
        expect(res).toEqual({ error: "ID de l'équipement invalide." })
    })

    it("errors when the equipment does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await editEquipmentAction(undefined, fd())).toEqual({
            error: "Équipement non trouvé."
        })
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editEquipmentAction(undefined, fd())
        expect(res).toEqual({
            error: "Echec de la modification de l'équipement. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the equipment and revalidates on the happy path", async () => {
        const res = await editEquipmentAction(undefined, fd())
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                name: "Tente",
                deposit: 100,
                quantity: 5,
                imagePath: "new.png"
            })
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/bagadAsso")
    })
})
