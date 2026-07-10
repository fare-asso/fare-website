import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorQuestion: { update: h.update } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { unarchiveTutorQuestion } from "../unarchiveTutorQuestion"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveTutorQuestion", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await unarchiveTutorQuestion(6)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await unarchiveTutorQuestion(6)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("unarchives the question and revalidates", async () => {
        const res = await unarchiveTutorQuestion(6)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 6 },
            data: { archived: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveTutorQuestion(6)).toEqual({
            success: false,
            error: "Echec du désarchivage de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
