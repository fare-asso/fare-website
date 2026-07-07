import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { itIsGatedBy } from "@/test/gates"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    deleteLink: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({ linkItem: { delete: h.deleteLink } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { deleteLinkAction } from "../deleteLinkAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:lien"]))
    h.deleteLink.mockResolvedValue({ id: 1 })
})

describe("deleteLinkAction", () => {
    itIsGatedBy({
        action: () => deleteLinkAction({ data: 1 }),
        permission: "delete:lien",
        getUser: h.getUser,
        writes: [h.deleteLink]
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteLink.mockRejectedValue(new Error("db down"))
        const res = await deleteLinkAction({ data: 1 })
        expect(res).toEqual({
            success: false,
            error: "Echec de la suppression du lien"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the link and revalidates on the happy path", async () => {
        const res = await deleteLinkAction({ data: 9 })
        expect(res).toEqual({ success: true })
        expect(h.deleteLink).toHaveBeenCalledWith({ where: { id: 9 } })
    })
})
