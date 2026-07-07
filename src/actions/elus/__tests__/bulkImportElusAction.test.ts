import { beforeEach, describe, expect, it, vi } from "vitest"

import { validBulkImportElu } from "@/test/factories/elus"
import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findConseil: vi.fn(),
    aggregate: vi.fn(),
    createMany: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        conseil: { findUnique: h.findConseil },
        elu: { aggregate: h.aggregate, createMany: h.createMany }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { bulkImportElusAction } from "../bulkImportElusAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:elu"]))
    h.findConseil.mockResolvedValue({ id: 1 })
    h.aggregate.mockResolvedValue({ _max: { order: 4 } })
    h.createMany.mockResolvedValue({ count: 2 })
})

describe("bulkImportElusAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(
            await bulkImportElusAction({ data: validBulkImportElu() })
        ).toEqual({
            success: false,
            error: "Authentication requise"
        })
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("requires the create:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("rejects an empty elus list", async () => {
        const res = await bulkImportElusAction({
            data: validBulkImportElu({ elus: [] })
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        })
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("returns an error when the conseil is not found", async () => {
        h.findConseil.mockResolvedValue(null)
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        expect(res).toEqual({ success: false, error: "Conseil non trouvé" })
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("captures and fails when the conseil lookup throws", async () => {
        h.findConseil.mockRejectedValue(new Error("db down"))
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("captures and fails when the max-order lookup throws", async () => {
        h.aggregate.mockRejectedValue(new Error("db down"))
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.createMany).not.toHaveBeenCalled()
    })

    it("captures and fails when the createMany throws", async () => {
        h.createMany.mockRejectedValue(new Error("db down"))
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("appends rows after the current max order", async () => {
        const res = await bulkImportElusAction({ data: validBulkImportElu() })
        expect(res).toEqual({ success: true, value: { count: 2 } })
        expect(h.createMany).toHaveBeenCalledWith({
            data: [
                {
                    name: "Jean Dupont",
                    position: "Président",
                    description: null,
                    conseilId: 1,
                    order: 5
                },
                {
                    name: "Marie Martin",
                    position: "Trésorière",
                    description: null,
                    conseilId: 1,
                    order: 6
                }
            ]
        })
    })

    it("starts ordering at 0 when the conseil has no elus", async () => {
        h.aggregate.mockResolvedValue({ _max: { order: null } })
        await bulkImportElusAction({ data: validBulkImportElu() })
        expect(h.createMany).toHaveBeenCalledWith({
            data: [
                expect.objectContaining({ order: 0 }),
                expect.objectContaining({ order: 1 })
            ]
        })
    })
})
