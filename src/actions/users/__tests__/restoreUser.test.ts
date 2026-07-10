import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () => dbModule({ user: { update: h.update } }))
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { restoreUser } from "../restoreUser"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:user"]))
    h.update.mockResolvedValue({ id: "u2" })
})

describe("restoreUser", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await restoreUser("u2")).toEqual({
            success: false,
            error: "Non authentifié"
        })
    })

    it("requires the delete:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        expect(await restoreUser("u2")).toEqual({
            success: false,
            error: "Permission insuffisante"
        })
    })

    it("captures and fails when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await restoreUser("u2")).toEqual({
            success: false,
            error: "Une erreur s'est produite lors de la restauration"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("restores the user", async () => {
        const res = await restoreUser("u2")
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "u2" },
            data: { deletedAt: null }
        })
    })
})
