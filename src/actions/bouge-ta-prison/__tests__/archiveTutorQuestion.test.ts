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

import archiveTutorQuestion from "../archiveTutorQuestion"

beforeEach(() => {
    h.update.mockResolvedValue({ id: 1 })
})

describe("archiveTutorQuestion", () => {
    it("archives the question and revalidates", async () => {
        const res = await archiveTutorQuestion(2)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { archived: expect.any(Date) }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison/questions"
        )
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await archiveTutorQuestion(2)).toEqual({
            error: "Echec de l'archivage de la question"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
