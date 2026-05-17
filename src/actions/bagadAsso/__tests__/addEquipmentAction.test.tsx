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
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ upload: h.upload })))

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

const fd = (o: Record<string, string | File> = {}): FormData => {
    const f = new FormData()
    f.set("name", "Tente")
    f.set("quantity", "5")
    f.set("guarantee", "100")
    f.set("equipment-picture", imageFile("tent.png"))
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:bagad-equipment"]))
    h.upload.mockResolvedValue({ data: { path: "equip.png" }, error: null })
    h.create.mockResolvedValue({ id: 1 })
})

describe("addEquipmentAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addEquipmentAction(undefined, fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:bagad-equipment permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addEquipmentAction(undefined, fd())
        expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await addEquipmentAction(undefined, fd({ name: "" }))
        expect(res).toEqual({
            error: "Un ou plusieurs champs ne sont pas remplis."
        })
    })

    it("rejects a non-numeric quantity", async () => {
        const res = await addEquipmentAction(undefined, fd({ quantity: "abc" }))
        expect(res).toEqual({ error: "Champs 'quantité' non-valide." })
    })

    it("rejects an unsupported image type", async () => {
        const res = await addEquipmentAction(
            undefined,
            fd({
                "equipment-picture": new File([new Uint8Array([1])], "f.txt", {
                    type: "text/plain"
                })
            })
        )
        expect(res.error).toMatch(/taille ou le format/)
    })

    it("returns the storage error when the upload fails", async () => {
        h.upload.mockResolvedValue({ data: null, error: { message: "boom" } })
        const res = await addEquipmentAction(undefined, fd())
        expect(res).toEqual({ error: "boom" })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addEquipmentAction(undefined, fd())
        expect(res).toEqual({
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the equipment and revalidates on the happy path", async () => {
        const res = await addEquipmentAction(undefined, fd())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: "Tente",
                deposit: 100,
                quantity: 5,
                imagePath: "equip.png"
            })
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/bagadAsso")
    })
})
