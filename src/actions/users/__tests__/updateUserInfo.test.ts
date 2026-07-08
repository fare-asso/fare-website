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

import { updateUserInfo } from "../updateUserInfo"

const input = {
    userId: "u2",
    data: { name: "New Name", email: "new@example.com" }
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:user"]))
    h.update.mockResolvedValue({ id: "u2" })
})

describe("updateUserInfo", () => {
    it("throws when not authenticated", async () => {
        h.getUser.mockResolvedValue(null)
        await expect(updateUserInfo(input)).rejects.toThrow(/Unauthorized/)
    })

    it("throws when lacking the edit:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        await expect(updateUserInfo(input)).rejects.toThrow(
            /Insufficient permissions/
        )
    })

    it("captures and fails when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await updateUserInfo(input)).toEqual({
            success: false,
            error: "An error occurred while updating user info."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the user on the happy path", async () => {
        const res = await updateUserInfo(input)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "u2" },
            data: {
                name: "New Name",
                email: "new@example.com"
            }
        })
    })
})
