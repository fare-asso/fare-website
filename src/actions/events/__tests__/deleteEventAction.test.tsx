import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db.server", () =>
    dbModule({ event: { findUnique: h.findUnique, delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteEventAction from "../deleteEventAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:event"]))
    h.findUnique.mockResolvedValue({ image: "" })
    h.deleteFn.mockResolvedValue({ id: 1 })
})

describe("deleteEventAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteEventAction({ eventId: 1 })).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:event permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteEventAction({ eventId: 1 })
        expect(res?.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("deletes the event and revalidates on the happy path", async () => {
        const res = await deleteEventAction({ eventId: 4 })
        expect(res).toBeUndefined()
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
    })

    it("captures when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        const res = await deleteEventAction({ eventId: 4 })
        expect(res).toBeUndefined()
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
