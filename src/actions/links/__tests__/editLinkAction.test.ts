import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEditLink } from "@/test/factories/links"
import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findCategory: vi.fn(),
    updateLink: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        linkCategory: { findUnique: h.findCategory },
        linkItem: { update: h.updateLink }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editLinkAction from "../editLinkAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:lien"]))
    h.findCategory.mockResolvedValue({ id: 1 })
    h.updateLink.mockResolvedValue({ id: 1 })
})

describe("editLinkAction", () => {
    itIsGatedBy({
        action: () => editLinkAction(validEditLink()),
        permission: "edit:lien",
        getUser: h.getUser,
        writes: [h.updateLink]
    })

    it("rejects an invalid payload", async () => {
        const res = await editLinkAction(validEditLink({ label: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.updateLink).not.toHaveBeenCalled()
    })

    it("returns an error when the category is not found", async () => {
        h.findCategory.mockResolvedValue(null)
        const res = await editLinkAction(validEditLink())
        expect(res).toEqual({
            success: false,
            error: "Catégorie introuvable."
        })
        expect(h.updateLink).not.toHaveBeenCalled()
    })

    it("captures and fails when the category lookup throws", async () => {
        h.findCategory.mockRejectedValue(new Error("db down"))
        const res = await editLinkAction(validEditLink())
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification du lien."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.updateLink).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.updateLink.mockRejectedValue(new Error("db down"))
        const res = await editLinkAction(validEditLink())
        expect(res).toEqual({
            success: false,
            error: "Échec de la modification du lien."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the link and revalidates on the happy path", async () => {
        const res = await editLinkAction(
            validEditLink({
                id: 7,
                categoryId: 3,
                label: "Discord",
                url: "https://discord.gg/fare"
            })
        )
        expect(res).toEqual({ success: true })
        expect(h.findCategory).toHaveBeenCalledWith({
            where: { id: 3 },
            select: { id: true }
        })
        expect(h.updateLink).toHaveBeenCalledWith({
            where: { id: 7 },
            data: {
                label: "Discord",
                url: "https://discord.gg/fare",
                categoryId: 3
            }
        })
    })
})
