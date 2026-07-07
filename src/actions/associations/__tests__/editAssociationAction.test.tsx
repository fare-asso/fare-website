import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationFormData } from "@/test/factories/associations"
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
    storageUpdate: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ update: h.storageUpdate })))

vi.mock("@/helpers/db", () =>
    dbModule({
        association: { findUnique: h.findUnique, update: h.update }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editAssociationAction from "../editAssociationAction"

const fd = (o: Record<string, string | File> = {}): FormData =>
    validAssociationFormData({ id: "1", ...o })

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:association"]))
    h.findUnique.mockResolvedValue({
        logoPath: "association-pictures/old.png",
        officePath: null
    })
    h.storageUpdate.mockResolvedValue({
        data: { path: "association-pictures/new.png" },
        error: null
    })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editAssociationAction(fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editAssociationAction(fd())
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when the current association cannot be fetched", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await editAssociationAction(fd())
        expect(res.error).toMatch(/récupération des informations/)
    })

    it("rejects a payload missing required fields", async () => {
        const res = await editAssociationAction(fd({ name: "" }))
        expect(res).toEqual({
            error: "Veuillez remplir tous les champs obligatoires."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a non-file logo", async () => {
        const res = await editAssociationAction(fd({ "logo-picture": "nope" }))
        expect(res).toEqual({ error: "Logo non-valide." })
    })

    it("returns the storage error when the update fails", async () => {
        h.storageUpdate.mockResolvedValue({
            data: null,
            error: { message: "upload boom" }
        })
        const res = await editAssociationAction(fd())
        expect(res).toEqual({ error: "upload boom" })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editAssociationAction(fd())
        expect(res).toEqual({ error: "db down" })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the association and revalidates on the happy path", async () => {
        const res = await editAssociationAction(fd())
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                name: "Asso Test",
                logoPath: "association-pictures/new.png"
            })
        })
    })
})
