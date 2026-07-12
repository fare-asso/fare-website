import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoSuggestion: { update: h.update } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { unarchiveSuggestionAction } from "../unarchiveSuggestionAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-suggestion"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveSuggestionAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await unarchiveSuggestionAction(1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:bagad-suggestion permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await unarchiveSuggestionAction(1)
        expect(res).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("unarchives the suggestion", async () => {
        const res = await unarchiveSuggestionAction(9)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { archived: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveSuggestionAction(9)).toEqual({
            success: false,
            error: "Échec du désarchivage de la suggestion"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
