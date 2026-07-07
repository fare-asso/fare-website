import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEventFormData } from "@/test/factories/events"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findCategory: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    getUserId: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db.server", () =>
    dbModule({
        category: { findUniqueOrThrow: h.findCategory },
        event: { update: h.update }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/helpers/user/id.server", () => ({ default: h.getUserId }))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { editEventAction } from "../editEventAction"

const fd = (o: Record<string, string | File> = {}): FormData =>
    validEventFormData({ id: "1", previousPath: "old-path", ...o })

const p2025 = (): Error => {
    const e = new Error("not found") as Error & { code: string }
    e.code = "P2025"
    return e
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:event"]))
    h.findCategory.mockResolvedValue({ id: 1, name: "Soiree" })
    h.getUserId.mockResolvedValue({ userId: "user-1" })
    h.upload.mockResolvedValue({ data: { path: "event-path" }, error: null })
    h.remove.mockResolvedValue({ error: null })
    h.update.mockResolvedValue({ id: 1 })
})

describe("editEventAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editEventAction({ data: fd() })).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:event permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editEventAction({ data: fd() })
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects a non-numeric id", async () => {
        const res = await editEventAction({ data: fd({ id: "abc" }) })
        expect(res.error).toMatch(/identifiant/i)
    })

    it("rejects a too-short name", async () => {
        const res = await editEventAction({ data: fd({ name: "ab" }) })
        expect(res.error).toMatch(/nom/)
    })

    it("rejects an unknown category", async () => {
        h.findCategory.mockRejectedValue(p2025())
        const res = await editEventAction({ data: fd() })
        expect(res.error).toMatch(/catégorie/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await editEventAction({ data: fd() })).toEqual({
            error: "La modification de l'évènement à échoué, veuillez réessayer"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the event and revalidates on the happy path", async () => {
        const res = await editEventAction({ data: fd() })
        expect(res).toEqual({ success: true })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: expect.objectContaining({
                name: "Soiree test",
                categoryId: 1
            })
        })
    })
})
