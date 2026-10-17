import { beforeEach, describe, expect, it, vi } from "vitest"

import { bagadAssoEquipmentRecord } from "@/test/factories/bagadAsso"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findMany: vi.fn(),
    getUser: vi.fn(),
    bookings: vi.fn(),
    capture: vi.fn()
}))
vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoEquipment: { findMany: h.findMany } })
)
vi.mock("@/helpers/bagadAsso", () => ({
    getNextBookingsByEquipment: h.bookings
}))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.capture))

import { listEquipmentsAction } from "../listEquipmentsAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:bagad-asso"]))
    h.findMany.mockResolvedValue([
        bagadAssoEquipmentRecord({ imagePath: null })
    ])
    h.bookings.mockResolvedValue(new Map())
})

describe("listEquipmentsAction", () => {
    it("requires authentication and access permission", async () => {
        h.getUser.mockResolvedValueOnce(null)
        expect(await listEquipmentsAction(undefined)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        h.getUser.mockResolvedValueOnce(mockUser([]))
        expect(await listEquipmentsAction(undefined)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.findMany).not.toHaveBeenCalled()
    })

    it("queries only active equipment for the dashboard", async () => {
        expect(await listEquipmentsAction(undefined)).toEqual({
            success: true,
            value: [
                {
                    equipment: bagadAssoEquipmentRecord({ imagePath: null }),
                    imageUrl: null,
                    nextBooking: null
                }
            ]
        })
        expect(h.findMany).toHaveBeenCalledWith({
            where: { deletedAt: null },
            orderBy: { name: "asc" }
        })
    })

    it("captures read failures", async () => {
        h.findMany.mockRejectedValueOnce(new Error("db down"))
        expect(await listEquipmentsAction(undefined)).toEqual({
            success: false,
            error: "Échec du chargement du matériel."
        })
        expect(h.capture).toHaveBeenCalledOnce()
    })
})
