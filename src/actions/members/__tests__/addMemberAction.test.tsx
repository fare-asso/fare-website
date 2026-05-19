import { beforeEach, describe, expect, it, vi } from "vitest"

import { validMemberFormData } from "@/test/factories/members"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    cacheModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    create: vi.fn(),
    getUser: vi.fn(),
    info: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ info: h.info })))

vi.mock("@/helpers/db", () => dbModule({ member: { create: h.create } }))
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import addMemberAction from "../addMemberAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["create:member"]))
    h.info.mockResolvedValue({ data: { name: "x" }, error: null })
    h.create.mockResolvedValue({ id: 1 })
})

describe("addMemberAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await addMemberAction(validMemberFormData())).toEqual({
            error: "Authentification requise"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("requires the create:member permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await addMemberAction(validMemberFormData())
        expect(res.error).toMatch(/permission/)
        expect(h.create).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
        const res = await addMemberAction(
            validMemberFormData({ email: "not-an-email" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("errors when the picture cannot be found in storage", async () => {
        h.info.mockResolvedValue({ data: null, error: { message: "gone" } })
        const res = await addMemberAction(validMemberFormData())
        expect(res).toEqual({
            success: false,
            error: "Erreur lors de la récupération de l'image"
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await addMemberAction(validMemberFormData())
        expect(res.success).toBe(false)
        expect(res.error).toMatch(/base de données a échoué/)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("creates the member and revalidates on the happy path", async () => {
        const res = await addMemberAction(validMemberFormData())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                position: "Tresoriere",
                picturePath: "members/lea.png",
                email: "lea@example.com"
            })
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/membres")
        expect(h.revalidatePath).toHaveBeenCalledWith("/a-propos/bureau")
    })
})
