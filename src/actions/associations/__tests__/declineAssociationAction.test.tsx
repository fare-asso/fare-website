import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationRecord } from "@/test/factories/associations"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        association: { findUnique: h.findUnique, delete: h.deleteFn }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { declineAssociationAction } from "../declineAssociationAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["approve:association"]))
    h.findUnique.mockResolvedValue(validAssociationRecord())
    h.deleteFn.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("declineAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await declineAssociationAction(1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the approve:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await declineAssociationAction(1)
        expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the association does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await declineAssociationAction(1)).toEqual({
            error: "Association introuvable"
        })
    })

    it("errors when the association is already approved", async () => {
        h.findUnique.mockResolvedValue(
            validAssociationRecord({ approved: new Date() })
        )
        expect(await declineAssociationAction(1)).toEqual({
            error: "Impossible de refuser une association déjà approuvée"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("continues deleting even when logo removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "storage boom" } })
        const res = await declineAssociationAction(1)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledOnce()
    })

    it("removes the logo and deletes on the happy path", async () => {
        const res = await declineAssociationAction(5)
        expect(res).toEqual({ success: true })
        expect(h.remove).toHaveBeenCalledWith(["association-pictures/logo.png"])
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 5 } })
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await declineAssociationAction(1)).toEqual({
            error: "Échec du refus de l'association"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
