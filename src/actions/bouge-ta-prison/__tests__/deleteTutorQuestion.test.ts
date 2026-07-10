import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorQuestion: { delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { deleteTutorQuestion } from "../deleteTutorQuestion"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.deleteFn.mockResolvedValue({ id: 1 })
})

describe("deleteTutorQuestion", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteTutorQuestion(8)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteTutorQuestion(8)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("deletes the question and revalidates", async () => {
        const res = await deleteTutorQuestion(8)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 8 } })
    })

    it("captures and returns an error when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteTutorQuestion(8)).toEqual({
            success: false,
            error: "Echec de la suppression de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
