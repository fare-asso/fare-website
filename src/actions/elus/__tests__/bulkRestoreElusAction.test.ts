import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateMany: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ elu: { updateMany: h.updateMany } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import bulkRestoreElusAction from "../bulkRestoreElusAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:elu"]))
    h.updateMany.mockResolvedValue({ count: 2 })
})

describe("bulkRestoreElusAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await bulkRestoreElusAction([1, 2])).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("requires the delete:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await bulkRestoreElusAction([1, 2])
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("rejects an empty id list", async () => {
        const res = await bulkRestoreElusAction([])
        expect(res).toEqual({
            success: false,
            error: "AucunE éluE à restaurer"
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.updateMany.mockRejectedValue(new Error("db down"))
        const res = await bulkRestoreElusAction([1, 2])
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("restores the elus and returns the count", async () => {
        const res = await bulkRestoreElusAction([1, 2])
        expect(res).toEqual({ success: true, value: { count: 2 } })
        expect(h.updateMany).toHaveBeenCalledWith({
            where: { id: { in: [1, 2] } },
            data: { deletedAt: null }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/elus")
    })
})
