import { beforeEach, describe, expect, it, vi } from "vitest"

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
    dbModule({ event: { findUnique: h.findUnique, delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { deleteEventAction } from "../deleteEventAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:event"]))
    h.findUnique.mockResolvedValue({ image: "" })
    h.deleteFn.mockResolvedValue({ id: 1 })
})

describe("deleteEventAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteEventAction({ eventId: 1 })).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:event permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteEventAction({ eventId: 1 })
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("deletes the event on the happy path", async () => {
        const res = await deleteEventAction({ eventId: 4 })
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
    })

    it("captures when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        const res = await deleteEventAction({ eventId: 4 })
        expect(res).toEqual({
            success: false,
            error: "Echec de la suppression de l'évènement"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
