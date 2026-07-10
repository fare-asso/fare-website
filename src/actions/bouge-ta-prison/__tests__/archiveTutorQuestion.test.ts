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

import { archiveTutorQuestion } from "../archiveTutorQuestion"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("archiveTutorQuestion", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await archiveTutorQuestion(2)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await archiveTutorQuestion(2)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("archives the question and revalidates", async () => {
        const res = await archiveTutorQuestion(2)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { archived: expect.any(Date) }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await archiveTutorQuestion(2)).toEqual({
            success: false,
            error: "Echec de l'archivage de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
