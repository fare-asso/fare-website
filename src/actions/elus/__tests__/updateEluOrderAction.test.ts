import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateElu: vi.fn(),
    transaction: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ elu: { update: h.updateElu }, $transaction: h.transaction })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { updateEluOrderAction } from "../updateEluOrderAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:elu"]))
    h.transaction.mockResolvedValue([])
})

const order = [
    { id: 1, order: 0 },
    { id: 2, order: 1 }
]

describe("updateEluOrderAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await updateEluOrderAction(order)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("requires the edit:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await updateEluOrderAction(order)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("captures and fails when the transaction throws", async () => {
        h.transaction.mockRejectedValue(new Error("tx failed"))
        const res = await updateEluOrderAction(order)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates every order in a transaction on the happy path", async () => {
        const res = await updateEluOrderAction(order)
        expect(res).toEqual({ success: true })
        expect(h.updateElu).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { order: 0 }
        })
        expect(h.updateElu).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { order: 1 }
        })
        expect(h.transaction).toHaveBeenCalledOnce()
    })
})
