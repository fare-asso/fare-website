import { beforeEach, describe, expect, it, vi } from "vitest"
import { cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorQuestion: { update: h.update } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import unarchiveTutorQuestion from "../unarchiveTutorQuestion"

beforeEach(() => {
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveTutorQuestion", () => {
    it("unarchives the question and revalidates", async () => {
        const res = await unarchiveTutorQuestion(6)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 6 },
            data: { archived: null }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison/questions"
        )
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveTutorQuestion(6)).toEqual({
            error: "Echec du désarchivage de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
