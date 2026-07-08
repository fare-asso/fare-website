import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoTicket: { delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { hardDeleteBagadAssoTicketAction } from "../hardDeleteTicketAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:bagad-ticket"]))
    h.deleteFn.mockResolvedValue({ id: 1 })
})

describe("hardDeleteBagadAssoTicketAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await hardDeleteBagadAssoTicketAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:bagad-ticket permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await hardDeleteBagadAssoTicketAction(1)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("hard-deletes the ticket", async () => {
        const res = await hardDeleteBagadAssoTicketAction(7)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 7 } })
    })

    it("captures and returns an error when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await hardDeleteBagadAssoTicketAction(7)).toEqual({
            success: false,
            error: "Echec de la suppression définitive du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
