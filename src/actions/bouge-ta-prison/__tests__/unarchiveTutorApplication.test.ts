import { beforeEach, describe, expect, it, vi } from "vitest"

import { cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorApplication: { update: h.update } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import unarchiveTutorApplication from "../unarchiveTutorApplication"

beforeEach(() => {
    h.update.mockResolvedValue({ id: 1 })
})

describe("unarchiveTutorApplication", () => {
    it("unarchives the application and revalidates", async () => {
        const res = await unarchiveTutorApplication(4)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 4 },
            data: { archived: null }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison"
        )
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await unarchiveTutorApplication(4)).toEqual({
            error: "Echec du désarchivage de la candidature"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
