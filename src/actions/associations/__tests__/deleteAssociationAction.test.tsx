import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationRecord } from "@/test/factories/associations"
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
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    deleteUser: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        association: { findUnique: h.findUnique, delete: h.deleteFn }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({
        storage: { from },
        auth: { admin: { deleteUser: h.deleteUser } }
    })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteAssociationAction from "../deleteAssociationAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:association"]))
    h.findUnique.mockResolvedValue(validAssociationRecord())
    h.deleteFn.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
    h.deleteUser.mockResolvedValue({ data: {}, error: null })
})

describe("deleteAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteAssociationAction(undefined, 1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteAssociationAction(undefined, 1)
        expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the association does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await deleteAssociationAction(undefined, 1)).toEqual({
            error: "Echec de la suppression de l'association"
        })
    })

    it("captures and fails when removing the representative throws", async () => {
        h.findUnique.mockResolvedValue(
            validAssociationRecord({ representativeId: "rep-1" })
        )
        h.deleteUser.mockRejectedValue(new Error("auth down"))
        expect(await deleteAssociationAction(undefined, 1)).toEqual({
            error: "Echec de la suppression du compte représentant"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("errors when the logo removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "storage boom" } })
        expect(await deleteAssociationAction(undefined, 1)).toEqual({
            error: "Echec de la suppression des images dans la base de données"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteAssociationAction(undefined, 1)).toEqual({
            error: "Echec de la suppression de l'association"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the association and revalidates on the happy path", async () => {
        const res = await deleteAssociationAction(undefined, 8)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 8 } })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/associations")
    })
})
