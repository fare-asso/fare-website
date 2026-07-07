import { beforeEach, describe, expect, it, vi } from "vitest"

import { validPartenaireRecord } from "@/test/factories/partenaires"
import { mockUser } from "@/test/factories/user"
import {
    authModule,
    dbModule,
    sentryModule,
    supabaseServerModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    findUnique: vi.fn(),
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        partenaire: { findUnique: h.findUnique, delete: h.deleteFn }
    })
)
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deletePartenaireAction from "../deletePartenaireAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:partner"]))
    h.findUnique.mockResolvedValue(validPartenaireRecord())
    h.deleteFn.mockResolvedValue(validPartenaireRecord())
    h.remove.mockResolvedValue({ data: [], error: null })
})

describe("deletePartenaireAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findUnique).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:partner permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deletePartenaireAction(undefined, 1)
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the partenaire does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Partenaire introuvable."
        })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the findUnique throws", async () => {
        h.findUnique.mockRejectedValue(new Error("db down"))
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Echec de la suppression du partenaire"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("captures and fails when the storage remove throws", async () => {
        h.remove.mockRejectedValue(new Error("storage down"))
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Echec de la suppression du logo dans la base de données"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the logo removal fails", async () => {
        h.remove.mockResolvedValue({
            data: null,
            error: { message: "boom" }
        })
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Echec de la suppression du logo dans la base de données"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("skips the storage removal when logoPath is empty", async () => {
        h.findUnique.mockResolvedValue(validPartenaireRecord({ logoPath: "" }))
        const res = await deletePartenaireAction(undefined, 4)
        expect(res).toEqual({ success: true })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            success: false,
            error: "Echec de la suppression du partenaire"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("removes the logo, deletes the record and revalidates on the happy path", async () => {
        h.findUnique.mockResolvedValue(
            validPartenaireRecord({ id: 9, logoPath: "uuid-abc.png" })
        )
        const res = await deletePartenaireAction(undefined, 9)
        expect(res).toEqual({ success: true })
        expect(h.remove).toHaveBeenCalledWith(["uuid-abc.png"])
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 9 } })
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
