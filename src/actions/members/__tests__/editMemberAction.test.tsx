import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    validMemberFormData,
    validMemberRecord
} from "@/test/factories/members"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    cacheModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({ member: { findUnique: h.findUnique, update: h.update } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import editMemberAction from "../editMemberAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:member"]))
    h.findUnique.mockResolvedValue(validMemberRecord())
    h.update.mockResolvedValue({ id: 1 })
    h.remove.mockResolvedValue({ error: null })
})

describe("editMemberAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await editMemberAction(validMemberFormData(), 1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the edit:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await editMemberAction(validMemberFormData(), 1)
        expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await editMemberAction(
            validMemberFormData({ email: "nope" }),
            1
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when the member does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        const res = await editMemberAction(validMemberFormData(), 7)
        expect(res.error).toContain("id: 7")
        expect(h.update).not.toHaveBeenCalled()
    })

    it("errors when removing the previous picture fails", async () => {
        h.findUnique.mockResolvedValue(
            validMemberRecord({ picturePath: "members/old.png" })
        )
        h.remove.mockResolvedValue({ error: { message: "boom" } })
        const res = await editMemberAction(validMemberFormData(), 1)
        expect(res).toEqual({
            success: false,
            error: "Erreur lors de la suppression de l'ancienne image."
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("captures and fails when the db update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        const res = await editMemberAction(validMemberFormData(), 1)
        expect(res.success).toBe(false)
        expect(res.error).toMatch(/base de données a échoué/)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("updates the member and revalidates on the happy path", async () => {
        const res = await editMemberAction(validMemberFormData(), 3)
        expect(res).toEqual({ success: true })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.update).toHaveBeenCalledWith({
            where: { id: 3 },
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                picturePath: "members/lea.png"
            })
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/membres")
    })
})
