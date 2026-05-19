import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ adhesion: { update: h.update } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import unarchiveAdhesionAction from "../unarchiveAdhesionAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:adhesion"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveAdhesionAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await unarchiveAdhesionAction(1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:adhesion permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await unarchiveAdhesionAction(1)
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("unarchives the adhesion and revalidates", async () => {
        const res = await unarchiveAdhesionAction(9)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { archived: null }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/adhesions")
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveAdhesionAction(1)).toEqual({
            error: "Echec de la désarchivation de la demande d'adhésion"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
