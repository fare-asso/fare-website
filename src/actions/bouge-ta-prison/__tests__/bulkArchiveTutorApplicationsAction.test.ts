import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    updateMany: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ bTPTutorApplication: { updateMany: h.updateMany } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { bulkArchiveTutorApplicationsAction } from "../bulkArchiveTutorApplicationsAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.updateMany.mockResolvedValue({ count: 2 })
})

describe("bulkArchiveTutorApplicationsAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        const res = await bulkArchiveTutorApplicationsAction({
            data: { ids: [1], archive: true }
        })
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await bulkArchiveTutorApplicationsAction({
            data: { ids: [1], archive: true }
        })
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/permission/)
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("rejects an empty selection", async () => {
        const res = await bulkArchiveTutorApplicationsAction({
            data: { ids: [], archive: true }
        })
        expect(res.success).toBe(false)
        expect(h.updateMany).not.toHaveBeenCalled()
    })

    it("captures and errors when the update fails", async () => {
        h.updateMany.mockRejectedValue(new Error("db down"))
        const res = await bulkArchiveTutorApplicationsAction({
            data: { ids: [1, 2], archive: true }
        })
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/archivage/i)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("archives the selected applications and revalidates", async () => {
        const res = await bulkArchiveTutorApplicationsAction({
            data: { ids: [1, 2], archive: true }
        })
        expect(res).toEqual({ success: true, value: { count: 2 } })
        const call = h.updateMany.mock.calls[0][0]
        expect(call.where).toEqual({ id: { in: [1, 2] } })
        expect(call.data.archived).toBeInstanceOf(Date)
    })

    it("unarchives by setting archived to null", async () => {
        await bulkArchiveTutorApplicationsAction({
            data: { ids: [1], archive: false }
        })
        expect(h.updateMany.mock.calls[0][0].data).toEqual({ archived: null })
    })
})
