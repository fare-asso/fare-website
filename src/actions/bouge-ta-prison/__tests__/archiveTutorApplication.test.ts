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

import archiveTutorApplication from "../archiveTutorApplication"

beforeEach(() => {
    h.update.mockResolvedValue({ id: 1 })
})

describe("archiveTutorApplication", () => {
    it("archives the application and revalidates", async () => {
        const res = await archiveTutorApplication(3)
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 3 },
            data: { archived: expect.any(Date) }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison"
        )
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await archiveTutorApplication(3)).toEqual({
            error: "Echec de l'archivage de la candidature"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
