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

import { setTicketValidatedAction } from "../setTicketValidatedAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("setTicketValidatedAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(
            await setTicketValidatedAction({ ticketId: 1, validated: true })
        ).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:bagad-ticket permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await setTicketValidatedAction({
            ticketId: 1,
            validated: true
        })
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload before touching the db", async () => {
        const res = await setTicketValidatedAction({
            ticketId: -1,
            validated: true
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("marks the ticket as validated", async () => {
        const res = await setTicketValidatedAction({
            ticketId: 9,
            validated: true
        })
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { validated: expect.any(Date) }
        })
    })

    it("unmarks a validated ticket", async () => {
        const res = await setTicketValidatedAction({
            ticketId: 9,
            validated: false
        })
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { validated: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(
            await setTicketValidatedAction({ ticketId: 9, validated: true })
        ).toEqual({
            success: false,
            error: "Echec de la mise à jour du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
