import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEditLinkCategory } from "@/test/factories/links"
import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    updateCategory: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ linkCategory: { update: h.updateCategory } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editLinkCategoryAction from "../editLinkCategoryAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:lien"]))
    h.updateCategory.mockResolvedValue({ id: 1 })
})

describe("editLinkCategoryAction", () => {
    itIsGatedBy({
        action: () => editLinkCategoryAction(validEditLinkCategory()),
        permission: "edit:lien",
        getUser: h.getUser,
        writes: [h.updateCategory]
    })

    it("rejects an invalid payload", async () => {
        const res = await editLinkCategoryAction(
            validEditLinkCategory({ id: 0 })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.updateCategory).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.updateCategory.mockRejectedValue(new Error("db down"))
        const res = await editLinkCategoryAction(validEditLinkCategory())
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification de la catégorie."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the category and revalidates on the happy path", async () => {
        const res = await editLinkCategoryAction(
            validEditLinkCategory({ id: 4, name: "Projets" })
        )
        expect(res).toEqual({ success: true })
        expect(h.updateCategory).toHaveBeenCalledWith({
            where: { id: 4 },
            data: { name: "Projets" }
        })
    })
})
