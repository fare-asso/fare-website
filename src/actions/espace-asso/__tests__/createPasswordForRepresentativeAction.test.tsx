import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    navigationModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    getRole: vi.fn(),
    updateUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/user/role", () => ({ default: h.getRole }))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ auth: { updateUser: h.updateUser } })
)
vi.mock("next/navigation", () => navigationModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import createPasswordForRepresentativeAction from "../createPasswordForRepresentativeAction"

const fd = (o: Record<string, string> = {}): FormData => {
    const f = new FormData()
    f.set("password", "supersecret")
    f.set("passwordConf", "supersecret")
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
}

beforeEach(() => {
    h.getRole.mockResolvedValue({ role: "ASSO_OWNER" })
    h.updateUser.mockResolvedValue({ error: null })
})

describe("createPasswordForRepresentativeAction", () => {
    it("errors when the user role cannot be resolved", async () => {
        h.getRole.mockResolvedValue({ error: "no user" })
        expect(
            await createPasswordForRepresentativeAction(undefined, fd())
        ).toEqual({ error: "Echec de l'authentification de l'utilisateur" })
    })

    it("rejects a non ASSO_OWNER user", async () => {
        h.getRole.mockResolvedValue({ role: "MEMBER" })
        const res = await createPasswordForRepresentativeAction(undefined, fd())
        expect(res.error).toMatch(/droits administrateur/)
    })

    it("rejects a missing password", async () => {
        const res = await createPasswordForRepresentativeAction(
            undefined,
            fd({ password: "" })
        )
        expect(res).toEqual({ error: "Mot de passe non valide" })
    })

    it("rejects a too-short password", async () => {
        const res = await createPasswordForRepresentativeAction(
            undefined,
            fd({ password: "short", passwordConf: "short" })
        )
        expect(res.error).toMatch(/8 caractères/)
    })

    it("rejects mismatched passwords", async () => {
        const res = await createPasswordForRepresentativeAction(
            undefined,
            fd({ passwordConf: "different1" })
        )
        expect(res.error).toMatch(/ne sont pas identiques/)
    })

    it("returns an error when the password update fails", async () => {
        h.updateUser.mockResolvedValue({ error: { message: "boom" } })
        const res = await createPasswordForRepresentativeAction(undefined, fd())
        expect(res.error).toMatch(/Echec de la création du mot de passe/)
    })

    it("captures and fails when the update throws", async () => {
        h.updateUser.mockRejectedValue(new Error("network down"))
        const res = await createPasswordForRepresentativeAction(undefined, fd())
        expect(res.error).toMatch(/Echec de la création du mot de passe/)
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("redirects to /espace-asso on success", async () => {
        await expect(
            createPasswordForRepresentativeAction(undefined, fd())
        ).rejects.toMatchObject({
            digest: expect.stringContaining("NEXT_REDIRECT")
        })
    })
})
