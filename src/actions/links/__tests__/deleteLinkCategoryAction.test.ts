import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    deleteCategory: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ linkCategory: { delete: h.deleteCategory } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteLinkCategoryAction from "../deleteLinkCategoryAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:lien"]))
    h.deleteCategory.mockResolvedValue({ id: 1 })
})

describe("deleteLinkCategoryAction", () => {
    itIsGatedBy({
        action: () => deleteLinkCategoryAction(1),
        permission: "delete:lien",
        getUser: h.getUser,
        writes: [h.deleteCategory]
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteCategory.mockRejectedValue(new Error("db down"))
        const res = await deleteLinkCategoryAction(1)
        expect(res).toEqual({
            success: false,
            error: "Echec de la suppression de la catégorie"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the category and revalidates on the happy path", async () => {
        const res = await deleteLinkCategoryAction(9)
        expect(res).toEqual({ success: true })
        expect(h.deleteCategory).toHaveBeenCalledWith({ where: { id: 9 } })
    })
})
