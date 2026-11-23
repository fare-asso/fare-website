import { beforeEach, describe, expect, it, vi } from "vitest"

import { validRemboursementRecord } from "@/test/factories/remboursement"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findMany: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ remboursement: { findMany: h.findMany } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { listRemboursementsAction } from "../listRemboursementsAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:remboursements"]))
    h.findMany.mockResolvedValue([validRemboursementRecord()])
})

describe("listRemboursementsAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await listRemboursementsAction(undefined)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("requires the access:remboursements permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        expect(await listRemboursementsAction(undefined)).toEqual({
            success: false,
            error: "Vous n'avez pas la permission"
        })
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("returns the list ordered by createdAt desc", async () => {
        const record = validRemboursementRecord()
        h.findMany.mockResolvedValue([record])
        const res = await listRemboursementsAction(undefined)
        expect(res).toEqual({ success: true, value: [record] })
        expect(h.findMany).toHaveBeenCalledWith({
            orderBy: { createdAt: "desc" }
        })
    })

    it("captures and returns an error when db query throws", async () => {
        h.findMany.mockRejectedValue(new Error("db down"))
        expect(await listRemboursementsAction(undefined)).toEqual({
            success: false,
            error: "Échec du chargement des demandes de remboursement."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
