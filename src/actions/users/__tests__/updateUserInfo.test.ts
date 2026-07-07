import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () => dbModule({ user: { update: h.update } }))
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateUserInfo from "../updateUserInfo"

const data = {
    name: "New Name",
    email: "new@example.com",
    role: "MEMBER" as const
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:user"], "ADMIN"))
    h.update.mockResolvedValue({ id: "u2" })
})

describe("updateUserInfo", () => {
    it("throws when not authenticated", async () => {
        h.getUser.mockResolvedValue(null)
        await expect(updateUserInfo("u2", data)).rejects.toThrow(/Unauthorized/)
    })

    it("throws when not an ADMIN", async () => {
        h.getUser.mockResolvedValue(mockUser(["edit:user"], "MEMBER"))
        await expect(updateUserInfo("u2", data)).rejects.toThrow(/Admin only/)
    })

    it("throws when lacking the edit:user permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        await expect(updateUserInfo("u2", data)).rejects.toThrow(
            /Insufficient permissions/
        )
    })

    it("captures and fails when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await updateUserInfo("u2", data)).toEqual({
            success: false,
            error: "An error occurred while updating user info."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the user on the happy path", async () => {
        const res = await updateUserInfo("u2", data)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "u2" },
            data: {
                name: "New Name",
                email: "new@example.com",
                role: "MEMBER"
            }
        })
    })
})
