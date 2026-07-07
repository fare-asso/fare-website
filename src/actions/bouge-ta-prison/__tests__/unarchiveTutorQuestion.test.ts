import { beforeEach, describe, expect, it, vi } from "vitest"

import { dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ bTPTutorQuestion: { update: h.update } })
)
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { unarchiveTutorQuestionAction } from "../unarchiveTutorQuestion"

beforeEach(() => {
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveTutorQuestion", () => {
    it("unarchives the question and revalidates", async () => {
        const res = await unarchiveTutorQuestionAction({ data: { id: 6 } })
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 6 },
            data: { archived: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveTutorQuestionAction({ data: { id: 6 } })).toEqual(
            {
                error: "Echec du désarchivage de la question"
            }
        )
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
