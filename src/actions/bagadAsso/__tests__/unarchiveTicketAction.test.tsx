import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ bagadAssoTicket: { update: h.update } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { unarchiveBagadAssoTicketAction } from "../unarchiveTicketAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveBagadAssoTicketAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(
            await unarchiveBagadAssoTicketAction({ data: { ticketId: 1 } })
        ).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:bagad-ticket permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await unarchiveBagadAssoTicketAction({
            data: { ticketId: 1 }
        })
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("unarchives the ticket and revalidates", async () => {
        const res = await unarchiveBagadAssoTicketAction({
            data: { ticketId: 9 }
        })
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { deleted: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(
            await unarchiveBagadAssoTicketAction({ data: { ticketId: 9 } })
        ).toEqual({
            error: "Echec de la désarchivation du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
