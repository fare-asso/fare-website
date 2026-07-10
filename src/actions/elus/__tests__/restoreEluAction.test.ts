import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateElu: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ elu: { update: h.updateElu } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { restoreEluAction } from "../restoreEluAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:elu"]))
    h.updateElu.mockResolvedValue({ id: 1 })
})

describe("restoreEluAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await restoreEluAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("requires the delete:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await restoreEluAction(1)
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the restore throws", async () => {
        h.updateElu.mockRejectedValue(new Error("update failed"))
        const res = await restoreEluAction(1)
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("restores the elu and revalidates on the happy path", async () => {
        const res = await restoreEluAction(7)
        expect(res).toEqual({ success: true })
        expect(h.updateElu).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { deletedAt: null }
        })
    })
})
