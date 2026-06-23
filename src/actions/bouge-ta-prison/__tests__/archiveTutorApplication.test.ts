import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorApplication: { update: h.update } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import archiveTutorApplication from "../archiveTutorApplication"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:btp"]))
    h.update.mockResolvedValue({ id: 1 })
})

describe("archiveTutorApplication", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await archiveTutorApplication(3)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the access:btp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await archiveTutorApplication(3)
        expect(res.success).toBe(false)
        expect(res.success === false && res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

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
            success: false,
            error: "Echec de l'archivage de la candidature"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })
})
