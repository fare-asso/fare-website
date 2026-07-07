import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ article: { findUnique: h.findUnique, update: h.update } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { switchVisibilityAction } from "../switchVisibilityAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["publish:article"]))
    h.findUnique.mockResolvedValue({ published: false })
    h.update.mockResolvedValue({ id: 1 })
})

describe("switchVisibilityAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await switchVisibilityAction({ data: 1 })).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the publish:article permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await switchVisibilityAction({ data: 1 })
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when the article does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await switchVisibilityAction({ data: 1 })).toEqual({
            error: "Article non trouvé"
        })
    })

    it("captures and fails when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await switchVisibilityAction({ data: 1 })).toEqual({
            error: "Echec du changement de visibilité de l'article"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("toggles the visibility and revalidates on the happy path", async () => {
        const res = await switchVisibilityAction({ data: 9 })
        expect(res).toEqual({})
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 9 },
            data: { published: true }
        })
    })
})
