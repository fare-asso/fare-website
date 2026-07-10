import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEventFormData } from "@/test/factories/events"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findCategory: vi.fn(),
    create: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("@/helpers/db", () =>
    dbModule({
        category: { findUniqueOrThrow: h.findCategory },
        event: { create: h.create }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from },
        getUserWithPermissions: h.getUser
    })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { createEventAction } from "../createEventAction"

const p2025 = (): Error => {
    const e = new Error("not found") as Error & { code: string }
    e.code = "P2025"
    return e
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:event"]))
    h.findCategory.mockResolvedValue({ id: 1, name: "Soiree" })
    h.upload.mockResolvedValue({ data: { path: "event-path" }, error: null })
    h.remove.mockResolvedValue({ error: null })
    h.create.mockResolvedValue({ id: 1 })
})

describe("createEventAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await createEventAction(validEventFormData())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:event permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await createEventAction(validEventFormData())
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects a too-short name", async () => {
        const res = await createEventAction(validEventFormData({ name: "ab" }))
        if (!res.success) expect(res.error).toMatch(/nom/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an unknown category", async () => {
        h.findCategory.mockRejectedValue(p2025())
        const res = await createEventAction(validEventFormData())
        if (!res.success) expect(res.error).toMatch(/catégorie/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("returns an error when the picture upload fails", async () => {
        h.upload.mockResolvedValue({ data: null, error: { message: "boom" } })
        const res = await createEventAction(validEventFormData())
        expect(res).toEqual({
            success: false,
            error: "L'upload de l'image à échoué, veuillez réessayer"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures, cleans up and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await createEventAction(validEventFormData())
        expect(res).toEqual({
            success: false,
            error: "La création de l'évènement à échoué, veuillez réessayer"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).toHaveBeenCalledWith(["event-path"])
    })

    it("creates the event on the happy path", async () => {
        const res = await createEventAction(validEventFormData())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: "Soiree test",
                categoryId: 1,
                creatorId: "user-1",
                image: "event-path"
            })
        })
    })
})
