import { beforeEach, describe, expect, it, vi } from "vitest"

import { validEditElu } from "@/test/factories/elus"
import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findConseil: vi.fn(),
    updateElu: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        conseil: { findUnique: h.findConseil },
        elu: { update: h.updateElu }
    })
)
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry.server", () => sentryModule(h.captureActionError))

import { editEluAction } from "../editEluAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:elu"]))
    h.findConseil.mockResolvedValue({ id: 1 })
    h.updateElu.mockResolvedValue({ id: 1 })
})

describe("editEluAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editEluAction({ data: validEditElu() })).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("requires the edit:elu permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editEluAction({ data: validEditElu() })
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editEluAction({
            data: validEditElu({ position: "" })
        })
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("returns an error when the conseil is not found", async () => {
        h.findConseil.mockResolvedValue(null)
        const res = await editEluAction({ data: validEditElu() })
        expect(res).toEqual({ success: false, error: "Conseil introuvable." })
        expect(h.updateElu).not.toHaveBeenCalled()
    })

    it("captures and fails when the update throws", async () => {
        h.updateElu.mockRejectedValue(new Error("update failed"))
        const res = await editEluAction({ data: validEditElu() })
        expect(res.success).toBe(false)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the elu and revalidates on the happy path", async () => {
        const res = await editEluAction({
            data: validEditElu({ description: "Membre" })
        })
        expect(res).toEqual({ success: true })
        expect(h.updateElu).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: "Jean Dupont",
                position: "Président",
                description: "Membre",
                conseilId: 1
            }
        })
    })
})
