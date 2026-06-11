import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateLink: vi.fn(),
    transaction: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        linkItem: { update: h.updateLink },
        $transaction: h.transaction
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateLinkOrderAction from "../updateLinkOrderAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:lien"]))
    h.transaction.mockResolvedValue([])
})

const order = [
    { id: 1, order: 0 },
    { id: 2, order: 1 }
]

describe("updateLinkOrderAction", () => {
    itIsGatedBy({
        action: () => updateLinkOrderAction(order),
        permission: "edit:lien",
        getUser: h.getUser,
        writes: [h.transaction]
    })

    it("rejects an invalid payload", async () => {
        const res = await updateLinkOrderAction([{ id: 0, order: -1 }])
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("captures and fails when the transaction throws", async () => {
        h.transaction.mockRejectedValue(new Error("tx failed"))
        const res = await updateLinkOrderAction(order)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })

    it("updates every order in a transaction on the happy path", async () => {
        const res = await updateLinkOrderAction(order)
        expect(res).toEqual({ success: true })
        expect(h.updateLink).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { order: 0 }
        })
        expect(h.updateLink).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { order: 1 }
        })
        expect(h.transaction).toHaveBeenCalledOnce()
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/liens")
        expect(h.revalidatePath).toHaveBeenCalledWith("/liens")
    })
})
