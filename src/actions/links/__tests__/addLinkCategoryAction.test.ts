import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAddLinkCategory } from "@/test/factories/links"
import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    createCategory: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({ linkCategory: { create: h.createCategory } })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { addLinkCategoryAction } from "../addLinkCategoryAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:lien"]))
    h.createCategory.mockResolvedValue({ id: 1 })
})

describe("addLinkCategoryAction", () => {
    itIsGatedBy({
        action: () => addLinkCategoryAction(validAddLinkCategory()),
        permission: "create:lien",
        getUser: h.getUser,
        writes: [h.createCategory]
    })

    it("rejects an invalid payload", async () => {
        const res = await addLinkCategoryAction(
            validAddLinkCategory({ name: "" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.createCategory).not.toHaveBeenCalled()
    })

    it("captures and fails when the insert throws", async () => {
        h.createCategory.mockRejectedValue(new Error("db down"))
        const res = await addLinkCategoryAction(validAddLinkCategory())
        expect(res).toEqual({
            success: false,
            error: "Échec de la création de la catégorie."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the category and revalidates on the happy path", async () => {
        const res = await addLinkCategoryAction(
            validAddLinkCategory({ name: "Projets" })
        )
        expect(res).toEqual({ success: true })
        expect(h.createCategory).toHaveBeenCalledWith({
            data: { name: "Projets" }
        })
    })
})
