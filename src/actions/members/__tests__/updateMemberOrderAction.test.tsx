import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    transaction: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => {
    const client: Record<string, unknown> = { member: { update: h.update } }
    // `$transaction` is a Prisma client method name; set it dynamically to
    // keep it off an object-literal identifier.
    Reflect.set(client, "$transaction", h.transaction)
    return dbModule(client)
})
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateMemberOrderAction from "../updateMemberOrderAction"

const order = [
    { id: 1, order: 2 },
    { id: 2, order: 1 }
]

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:member"]))
    h.update.mockReturnValue({ id: 1 })
    h.transaction.mockResolvedValue([])
})

describe("updateMemberOrderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await updateMemberOrderAction(order)).toEqual({
            error: "Authentification requise"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("requires the edit:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await updateMemberOrderAction(order)
        expect(res.error).toMatch(/permission/)
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("captures and fails when the transaction throws", async () => {
        h.transaction.mockRejectedValue(new Error("db down"))
        expect(await updateMemberOrderAction(order)).toEqual({
            error: "La mise à jour de l'ordre des membres a échoué. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the order in a transaction and revalidates", async () => {
        const res = await updateMemberOrderAction(order)
        expect(res).toEqual({ success: true })
        expect(h.transaction).toHaveBeenCalledOnce()
        expect(h.update).toHaveBeenCalledTimes(2)
    })
})
