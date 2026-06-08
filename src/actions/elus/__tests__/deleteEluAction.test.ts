import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findElu: vi.fn(),
    updateElu: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ elu: { findUnique: h.findElu, update: h.updateElu } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteEluAction from "../deleteEluAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:elu"]))
    h.findElu.mockResolvedValue({ id: 1, deletedAt: null })
    h.updateElu.mockResolvedValue({ id: 1 })
})

describe("deleteEluAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteEluAction(undefined, 1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("requires the delete:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteEluAction(undefined, 1)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("returns an error when the elu is not found", async () => {
        h.findElu.mockResolvedValue(null)
        const res = await deleteEluAction(undefined, 1)
        expect(res).toEqual({ success: false, error: "Élu·e introuvable." })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the lookup throws", async () => {
        h.findElu.mockRejectedValue(new Error("db down"))
        const res = await deleteEluAction(undefined, 1)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the soft delete throws", async () => {
        h.updateElu.mockRejectedValue(new Error("update failed"))
        const res = await deleteEluAction(undefined, 1)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("soft-deletes the elu and revalidates on the happy path", async () => {
        const res = await deleteEluAction(undefined, 7)
        expect(res).toEqual({ success: true })
        expect(h.updateElu).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { deletedAt: expect.any(Date) }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/elus")
    })
})
