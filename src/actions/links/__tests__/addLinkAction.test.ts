import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAddLink } from "@/test/factories/links"
import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findCategory: vi.fn(),
    createLink: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        linkCategory: { findUnique: h.findCategory },
        linkItem: { create: h.createLink }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { addLinkAction } from "../addLinkAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:lien"]))
    h.findCategory.mockResolvedValue({ id: 1 })
    h.createLink.mockResolvedValue({ id: 1 })
})

describe("addLinkAction", () => {
    itIsGatedBy({
        action: () => addLinkAction({ data: validAddLink() }),
        permission: "create:lien",
        getUser: h.getUser,
        writes: [h.createLink]
    })

    it("rejects an invalid payload", async () => {
        const res = await addLinkAction({
            data: validAddLink({ url: "/relatif" })
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.createLink).not.toHaveBeenCalled()
    })

    it("returns an error when the category is not found", async () => {
        h.findCategory.mockResolvedValue(null)
        const res = await addLinkAction({ data: validAddLink() })
        expect(res).toEqual({
            success: false,
            error: "Catégorie introuvable."
        })
        expect(h.createLink).not.toHaveBeenCalled()
    })

    it("captures and fails when the category lookup throws", async () => {
        h.findCategory.mockRejectedValue(new Error("db down"))
        const res = await addLinkAction({ data: validAddLink() })
        expect(res).toEqual({
            success: false,
            error: "Échec de la création du lien."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.createLink).not.toHaveBeenCalled()
    })

    it("captures and fails when the insert throws", async () => {
        h.createLink.mockRejectedValue(new Error("db down"))
        const res = await addLinkAction({ data: validAddLink() })
        expect(res).toEqual({
            success: false,
            error: "Échec de la création du lien."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the link and revalidates on the happy path", async () => {
        const res = await addLinkAction({
            data: validAddLink({
                categoryId: 3,
                label: "Discord",
                url: "https://discord.gg/fare"
            })
        })
        expect(res).toEqual({ success: true })
        expect(h.findCategory).toHaveBeenCalledWith({
            where: { id: 3 },
            select: { id: true }
        })
        expect(h.createLink).toHaveBeenCalledWith({
            data: {
                label: "Discord",
                url: "https://discord.gg/fare",
                categoryId: 3
            }
        })
    })
})
