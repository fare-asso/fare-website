import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ remboursement: { update: h.update } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { unarchiveRemboursementAction } from "../unarchiveRemboursementAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:remboursement"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveRemboursementAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await unarchiveRemboursementAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:remboursement permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        expect(await unarchiveRemboursementAction(1)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("unarchives the remboursement", async () => {
        expect(await unarchiveRemboursementAction(7)).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { archived: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveRemboursementAction(1)).toEqual({
            success: false,
            error: "Échec du désarchivage de la demande de remboursement"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
