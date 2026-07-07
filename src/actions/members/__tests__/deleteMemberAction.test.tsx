import { beforeEach, describe, expect, it, vi } from "vitest"

import { validMemberRecord } from "@/test/factories/members"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () => dbModule({ member: { delete: h.deleteFn } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteMemberAction from "../deleteMemberAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:member"]))
    h.deleteFn.mockResolvedValue(validMemberRecord())
    h.remove.mockResolvedValue({ error: null })
})

describe("deleteMemberAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteMemberAction({ id: 1 })).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteMemberAction({ id: 1 })
        expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the db delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteMemberAction({ id: 1 })).toEqual({
            error: "Echec de la suppression du membre"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("returns an error when the storage removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "storage boom" } })
        expect(await deleteMemberAction({ id: 1 })).toEqual({
            error: "storage boom"
        })
    })

    it("deletes the member, removes the picture and revalidates", async () => {
        const res = await deleteMemberAction({ id: 9 })
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 9 } })
        expect(h.remove).toHaveBeenCalledWith(["members/lea.png"])
    })
})
