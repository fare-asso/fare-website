import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({ article: { findUnique: h.findUnique, delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteArticleAction from "../deleteArticleAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:article"]))
    h.findUnique.mockResolvedValue({ id: 1, imagesPath: ["a.png"] })
    h.deleteFn.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("deleteArticleAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteArticleAction(undefined, 1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:article permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteArticleAction(undefined, 1)
        expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the article does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await deleteArticleAction(undefined, 1)).toEqual({
            error: "Echec de la suppression de l'article"
        })
    })

    it("errors when the image removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "boom" } })
        expect(await deleteArticleAction(undefined, 1)).toEqual({
            error: "Echec de la suppression des images dans la base de données"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteArticleAction(undefined, 1)).toEqual({
            error: "Echec de la suppression de l'article"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("deletes the article and revalidates on the happy path", async () => {
        const res = await deleteArticleAction(undefined, 4)
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
    })
})
