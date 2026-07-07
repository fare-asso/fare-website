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
    update: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    upload: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ remove: h.remove, upload: h.upload }))
)

vi.mock("@/helpers/db", () =>
    dbModule({ article: { findUnique: h.findUnique, update: h.update } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editArticleAction from "../editArticleAction"

const fd = (o: Record<string, string> = {}): FormData => {
    const f = new FormData()
    f.set("id", "1")
    f.set("title", "Titre")
    f.set("content", JSON.stringify({ type: "doc", content: [] }))
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:article"]))
    h.findUnique.mockResolvedValue({ id: 1, imagesPath: ["a.png"] })
    h.remove.mockResolvedValue({ error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editArticleAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editArticleAction(fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:article permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editArticleAction(fd())
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a non-numeric id", async () => {
        const res = await editArticleAction(fd({ id: "abc" }))
        expect(res).toEqual({ error: "L'id de l'article est eronné" })
    })

    it("rejects a payload missing required fields", async () => {
        const res = await editArticleAction(fd({ title: "" }))
        expect(res).toEqual({
            error: "Veuillez remplir tous les champs obligatoires."
        })
    })

    it("errors when the article does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await editArticleAction(fd())).toEqual({
            error: "Article not found"
        })
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await editArticleAction(fd())).toEqual({
            error: "Echec de la modification de l'article"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the article and revalidates on the happy path", async () => {
        const res = await editArticleAction(fd())
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({ title: "Titre" })
        })
    })
})
