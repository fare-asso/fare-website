import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ upload: h.upload })))

vi.mock("@/helpers/db.server", () =>
    dbModule({ article: { create: h.create } })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { createArticleAction } from "../createArticleAction"

const fd = (o: Record<string, string> = {}): FormData => {
    const f = new FormData()
    f.set("title", "Mon article")
    f.set("content", JSON.stringify({ type: "doc", content: [] }))
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:article"]))
    h.create.mockResolvedValue({ id: 1 })
})

describe("createArticleAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await createArticleAction({ data: fd() })).toEqual({
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:article permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await createArticleAction({ data: fd() })
        expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a payload missing required fields", async () => {
        const res = await createArticleAction({ data: fd({ title: "" }) })
        expect(res).toEqual({
            error: "Veuillez remplir tous les champs obligatoires."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        expect(await createArticleAction({ data: fd() })).toEqual({
            error: "Echec de la création de l'article"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the article and revalidates on the happy path", async () => {
        const res = await createArticleAction({ data: fd() })
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: "Mon article",
                authorId: "user-1"
            })
        })
    })
})
