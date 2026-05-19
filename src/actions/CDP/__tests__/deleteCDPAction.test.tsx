import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import {
    authModule,
    cacheModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({ communiqueDePresse: { delete: h.deleteFn } })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deleteCDPAction from "../deleteCDPAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:cdp"]))
    h.deleteFn.mockResolvedValue({ id: 1, filePath: "cdp/file.pdf" })
    h.remove.mockResolvedValue({ error: null })
})

describe("deleteCDPAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deleteCDPAction({ id: 1 })).toEqual({
            error: "Authentification requise"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:cdp permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deleteCDPAction({ id: 1 })
        expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deleteCDPAction({ id: 1 })).toEqual({
            error: "Echec de la suppression du communiqué de presse"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("errors when the storage removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "boom" } })
        expect(await deleteCDPAction({ id: 1 })).toEqual({
            error: "Echec de la suppression du communiqué de presse dans le stockage"
        })
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })

    it("deletes the CDP and revalidates on the happy path", async () => {
        const res = await deleteCDPAction({ id: 3 })
        expect(res).toEqual({ success: true })
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 3 } })
        expect(h.remove).toHaveBeenCalledWith(["cdp/file.pdf"])
        expect(h.revalidatePath).toHaveBeenCalledWith("/presse")
    })
})
