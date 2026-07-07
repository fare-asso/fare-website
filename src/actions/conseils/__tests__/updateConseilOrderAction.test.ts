import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateConseil: vi.fn(),
    transaction: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        conseil: { update: h.updateConseil },
        $transaction: h.transaction
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateConseilOrderAction from "../updateConseilOrderAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:instance"]))
    h.transaction.mockResolvedValue([])
})

const order = [
    { id: 1, order: 0 },
    { id: 2, order: 1 }
]

describe("updateConseilOrderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await updateConseilOrderAction(order)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("is gated on the edit:instance permission (reused for conseils)", async () => {
        h.getUser.mockResolvedValue(mockUser(["edit:elu"]))
        const res = await updateConseilOrderAction(order)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("captures and fails when the transaction throws", async () => {
        h.transaction.mockRejectedValue(new Error("tx failed"))
        const res = await updateConseilOrderAction(order)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates every order in a transaction on the happy path", async () => {
        const res = await updateConseilOrderAction(order)
        expect(res).toEqual({ success: true })
        expect(h.updateConseil).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { order: 0 }
        })
        expect(h.updateConseil).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { order: 1 }
        })
        expect(h.transaction).toHaveBeenCalledOnce()
    })
})
