import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    userUpdate: vi.fn(),
    assoUpdate: vi.fn(),
    getUser: vi.fn(),
    invite: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        user: { update: h.userUpdate },
        association: { update: h.assoUpdate }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ auth: { admin: { inviteUserByEmail: h.invite } } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import inviteRepresentativeAction from "../inviteRepresentativeAction"

const fd = (o: Record<string, string> = {}): FormData => {
    const f = new FormData()
    f.set("email", "rep@example.com")
    f.set("associationId", "1")
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["invite:representative"]))
    h.invite.mockResolvedValue({
        data: { user: { id: "rep-1" } },
        error: null
    })
    h.userUpdate.mockResolvedValue({ id: "rep-1" })
    h.assoUpdate.mockResolvedValue({ id: 1 })
})

describe("inviteRepresentativeAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await inviteRepresentativeAction(fd())).toEqual({
            error: "Authentification requise"
        })
        expect(h.invite).not.toHaveBeenCalled()
    })

    it("requires the invite:representative permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await inviteRepresentativeAction(fd())
        expect(res.error).toMatch(/permission/)
        expect(h.invite).not.toHaveBeenCalled()
    })

    it("rejects a missing email", async () => {
        const res = await inviteRepresentativeAction(fd({ email: "" }))
        expect(res).toEqual({
            error: "Veuillez remplir tous les champs obligatoires."
        })
    })

    it("rejects an invalid email", async () => {
        const res = await inviteRepresentativeAction(
            fd({ email: "not-an-email" })
        )
        expect(res).toEqual({ error: "Adresse E-mail non valide." })
        expect(h.invite).not.toHaveBeenCalled()
    })

    it("reports when the user already exists", async () => {
        h.invite.mockResolvedValue({
            data: null,
            error: { code: "email_exists" }
        })
        expect(await inviteRepresentativeAction(fd())).toEqual({
            error: "Cet utilisateur existe déjà"
        })
        expect(h.userUpdate).not.toHaveBeenCalled()
    })

    it("reports a generic invitation failure", async () => {
        h.invite.mockResolvedValue({
            data: null,
            error: { code: "other" }
        })
        expect(await inviteRepresentativeAction(fd())).toEqual({
            error: "Echec de l'invitation du représentant"
        })
    })

    it("captures and fails when a db update throws", async () => {
        h.userUpdate.mockRejectedValue(new Error("db down"))
        expect(await inviteRepresentativeAction(fd())).toEqual({
            error: "Echec de l'invitation du représentant"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("invites, links and revalidates on the happy path", async () => {
        const res = await inviteRepresentativeAction(fd({ associationId: "7" }))
        expect(res).toEqual({ success: true })
        expect(h.userUpdate).toHaveBeenCalledWith({
            where: { id: "rep-1" },
            data: { role: "ASSO_OWNER" }
        })
        expect(h.assoUpdate).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { representativeId: "rep-1" }
        })
    })
})
