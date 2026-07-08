import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ adhesion: { update: h.update } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { archiveAdhesionAction } from "../archiveAdhesionAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:adhesion"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("archiveAdhesionAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await archiveAdhesionAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:adhesion permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await archiveAdhesionAction(1)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("archives the adhesion", async () => {
        const res = await archiveAdhesionAction(7)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { archived: expect.any(Date) }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await archiveAdhesionAction(1)).toEqual({
            success: false,
            error: "Echec de l'archivage de la demande d'adhésion"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
