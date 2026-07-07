import { isRedirect } from "@tanstack/react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { sentryModule, supabaseServerModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    signOut: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/supabase.server", () =>
    supabaseServerModule({ auth: { signOut: h.signOut } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { signOut } from "../signOutAction"

beforeEach(() => {
    h.signOut.mockResolvedValue({ error: null })
})

describe("signOut", () => {
    it("returns the error when supabase sign-out fails", async () => {
        h.signOut.mockResolvedValue({ error: { message: "boom" } })
        expect(await signOut()).toEqual({ success: false, error: "boom" })
    })

    it("captures and fails when sign-out throws", async () => {
        h.signOut.mockRejectedValue(new Error("network down"))
        expect(await signOut()).toEqual({
            success: false,
            error: "Echec de la déconnexion"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("redirects to /login on success", async () => {
        await expect(signOut()).rejects.toSatisfy(
            (err) =>
                isRedirect(err) &&
                (err as { options: { href: string } }).options.href === "/login"
        )
    })
})
