import { beforeEach, describe, expect, it, vi } from "vitest"

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
    countConseil: vi.fn(),
    deleteInstance: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        instance: { findUnique: h.findInstance, delete: h.deleteInstance },
        conseil: { count: h.countConseil }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteInstanceAction from "../deleteInstanceAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:instance"]))
    h.findInstance.mockResolvedValue({ id: 1, logoPaths: [] })
    h.countConseil.mockResolvedValue(0)
    h.deleteInstance.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ data: [], error: null })
})

describe("deleteInstanceAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteInstanceAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteInstance).not.toHaveBeenCalled()
    })

    it("requires the delete:instance permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteInstanceAction(1)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.deleteInstance).not.toHaveBeenCalled()
    })

    it("returns an error when the instance is not found", async () => {
        h.findInstance.mockResolvedValue(null)
        const res = await deleteInstanceAction(1)
        expect(res).toEqual({ success: false, error: "Instance introuvable." })
        expect(h.deleteInstance).not.toHaveBeenCalled()
    })

    it("refuses to delete an instance that still has conseils", async () => {
        h.countConseil.mockResolvedValue(2)
        const res = await deleteInstanceAction(1)
        expect(res).toEqual({
            success: false,
            error: "Supprimez d'abord les conseils de cette instance avant de la supprimer."
        })
        expect(h.deleteInstance).not.toHaveBeenCalled()
    })

    it("captures and fails when logo removal rejects", async () => {
        h.findInstance.mockResolvedValue({ id: 1, logoPaths: ["x.png"] })
        h.remove.mockRejectedValue(new Error("storage down"))
        const res = await deleteInstanceAction(1)
        expect(res).toEqual({
            success: false,
            error: "Echec de la suppression des logos de l'instance"
        })
        expect(h.deleteInstance).not.toHaveBeenCalled()
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteInstance.mockRejectedValue(new Error("db down"))
        const res = await deleteInstanceAction(1)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("removes logos then deletes the instance on the happy path", async () => {
        h.findInstance.mockResolvedValue({ id: 5, logoPaths: ["x.png"] })
        const res = await deleteInstanceAction(5)
        expect(res).toEqual({ success: true })
        expect(h.remove).toHaveBeenCalledWith(["x.png"])
        expect(h.deleteInstance).toHaveBeenCalledWith({ where: { id: 5 } })
    })

    it("skips storage removal when the instance has no logos", async () => {
        const res = await deleteInstanceAction(1)
        expect(res).toEqual({ success: true })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteInstance).toHaveBeenCalledWith({ where: { id: 1 } })
    })
})
