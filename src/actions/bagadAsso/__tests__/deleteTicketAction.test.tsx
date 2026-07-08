import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoTicket: { update: h.update } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { deleteBagadAssoTicketAction } from "../deleteTicketAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:bagad-ticket"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("deleteBagadAssoTicketAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteBagadAssoTicketAction(1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the delete:bagad-ticket permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteBagadAssoTicketAction(1)
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("soft-deletes the ticket", async () => {
        const res = await deleteBagadAssoTicketAction(5)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 5 },
            data: { deleted: expect.any(Date) }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await deleteBagadAssoTicketAction(5)).toEqual({
            error: "Echec de la suppression du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
