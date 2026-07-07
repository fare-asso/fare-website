import { beforeEach, describe, expect, it, vi } from "vitest"

import { dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteFn: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ bTPTutorQuestion: { delete: h.deleteFn } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteTutorQuestion from "../deleteTutorQuestion"

beforeEach(() => {
    h.deleteFn.mockResolvedValue({ id: 1 })
})

describe("deleteTutorQuestion", () => {
    it("deletes the question and revalidates", async () => {
        const res = await deleteTutorQuestion(8)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 8 } })
    })

    it("captures and returns an error when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteTutorQuestion(8)).toEqual({
            error: "Echec de la suppression de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
