import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateInstance: vi.fn(),
    transaction: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        instance: { update: h.updateInstance },
        $transaction: h.transaction
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateInstanceOrderAction from "../updateInstanceOrderAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:instance"]))
    h.transaction.mockResolvedValue([])
})

const order = [
    { id: 1, order: 0 },
    { id: 2, order: 1 }
]

describe("updateInstanceOrderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await updateInstanceOrderAction(order)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("requires the edit:instance permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await updateInstanceOrderAction(order)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("captures and fails when the transaction throws", async () => {
        h.transaction.mockRejectedValue(new Error("tx failed"))
        const res = await updateInstanceOrderAction(order)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates every order in a transaction on the happy path", async () => {
        const res = await updateInstanceOrderAction(order)
        expect(res).toEqual({ success: true })
        expect(h.updateInstance).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { order: 0 }
        })
        expect(h.updateInstance).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { order: 1 }
        })
        expect(h.transaction).toHaveBeenCalledOnce()
    })
})
