import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAddElu } from "@/test/factories/elus"
import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findConseil: vi.fn(),
    createElu: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        conseil: { findUnique: h.findConseil },
        elu: { create: h.createElu }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addEluAction from "../addEluAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:elu"]))
    h.findConseil.mockResolvedValue({ id: 1 })
    h.createElu.mockResolvedValue({ id: 10 })
})

describe("addEluAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addEluAction(validAddElu())).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.createElu).not.toHaveBeenCalled()
    })

    it("requires the create:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addEluAction(validAddElu())
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.createElu).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addEluAction(validAddElu({ name: "" }))
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.createElu).not.toHaveBeenCalled()
    })

    it("returns an error when the conseil is not found", async () => {
        h.findConseil.mockResolvedValue(null)
        const res = await addEluAction(validAddElu())
        expect(res).toEqual({ success: false, error: "Conseil introuvable." })
        expect(h.createElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the conseil lookup throws", async () => {
        h.findConseil.mockRejectedValue(new Error("db down"))
        const res = await addEluAction(validAddElu())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.createElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the insert throws", async () => {
        h.createElu.mockRejectedValue(new Error("insert failed"))
        const res = await addEluAction(validAddElu())
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the elu and revalidates on the happy path", async () => {
        const res = await addEluAction(validAddElu({ description: "Membre" }))
        expect(res).toEqual({ success: true })
        expect(h.createElu).toHaveBeenCalledWith({
            data: {
                name: "Jean Dupont",
                position: "Président",
                description: "Membre",
                conseilId: 1
            }
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/elus")
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/representation/nos-elues"
        )
    })

    it("defaults description to null when omitted", async () => {
        await addEluAction(validAddElu())
        expect(h.createElu).toHaveBeenCalledWith({
            data: expect.objectContaining({ description: null })
        })
    })
})
