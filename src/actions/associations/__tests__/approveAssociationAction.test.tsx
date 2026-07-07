import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssociationRecord } from "@/test/factories/associations"
import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    updateAsso: vi.fn(),
    updateAdhesion: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        association: { findUnique: h.findUnique, update: h.updateAsso },
        adhesion: { update: h.updateAdhesion }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import approveAssociationAction from "../approveAssociationAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["approve:association"]))
    h.findUnique.mockResolvedValue(validAssociationRecord())
    h.updateAsso.mockResolvedValue({ id: 1 })
    h.updateAdhesion.mockResolvedValue({ id: 1 })
})

describe("approveAssociationAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await approveAssociationAction(undefined, 1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.updateAsso).not.toHaveBeenCalled()
    })

    it("requires the approve:association permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await approveAssociationAction(undefined, 1)
        expect(res.error).toMatch(/permission/)
        expect(h.updateAsso).not.toHaveBeenCalled()
    })

    it("errors when the association does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await approveAssociationAction(undefined, 1)).toEqual({
            error: "Association introuvable"
        })
    })

    it("errors when the association is already approved", async () => {
        h.findUnique.mockResolvedValue(
            validAssociationRecord({ approved: new Date() })
        )
        expect(await approveAssociationAction(undefined, 1)).toEqual({
            error: "Cette association est déjà approuvée"
        })
        expect(h.updateAsso).not.toHaveBeenCalled()
    })

    it("approves and revalidates without a linked adhesion", async () => {
        const res = await approveAssociationAction(undefined, 3)
        expect(res).toEqual({ success: true })
        expect(h.updateAsso).toHaveBeenCalledWith({
            where: { id: 3 },
            data: { approved: expect.any(Date) }
        })
        expect(h.updateAdhesion).not.toHaveBeenCalled()
    })

    it("archives the linked adhesion when present", async () => {
        h.findUnique.mockResolvedValue(
            validAssociationRecord({ adhesionId: 42 })
        )
        const res = await approveAssociationAction(undefined, 3)
        expect(res).toEqual({ success: true })
        expect(h.updateAdhesion).toHaveBeenCalledWith({
            where: { id: 42 },
            data: { archived: expect.any(Date) }
        })
    })

    it("captures and fails when the update throws", async () => {
        h.updateAsso.mockRejectedValue(new Error("db down"))
        expect(await approveAssociationAction(undefined, 1)).toEqual({
            error: "Échec de l'approbation de l'association"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
