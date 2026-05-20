import { beforeEach, describe, expect, it, vi } from "vitest"

import { validPartenaireRecord } from "@/test/factories/partenaires"
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
    deleteFn: vi.fn(),
    getUser: vi.fn(),
    remove: vi.fn(),
    revalidatePath: vi.fn(),
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
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import deletePartenaireAction from "../deletePartenaireAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["delete:partner"]))
    h.findUnique.mockResolvedValue(validPartenaireRecord())
    h.deleteFn.mockResolvedValue(validPartenaireRecord())
    h.remove.mockResolvedValue({ error: null })
})

describe("deletePartenaireAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            error: "Authentification requise"
        })
        expect(h.findUnique).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("requires the delete:partner permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await deletePartenaireAction(undefined, 1)
        expect(res?.error).toMatch(/permission/)
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the partenaire does not exist", async () => {
        h.findUnique.mockResolvedValue(null)
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            error: "Echec de la suppression du partenaire"
        })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("errors when the logo removal fails", async () => {
        h.remove.mockResolvedValue({ error: { message: "boom" } })
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            error: "Echec de la suppression du logo dans la base de données"
        })
        expect(h.deleteFn).not.toHaveBeenCalled()
    })

    it("skips the storage removal when logoPath is empty", async () => {
        h.findUnique.mockResolvedValue(
            validPartenaireRecord({ logoPath: "" })
        )
        const res = await deletePartenaireAction(undefined, 4)
        expect(res).toBeUndefined()
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 4 } })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/partenaires")
        expect(h.revalidatePath).toHaveBeenCalledWith("/a-propos/partenaires")
    })

    it("captures and fails when the delete throws", async () => {
        h.deleteFn.mockRejectedValue(new Error("db down"))
        expect(await deletePartenaireAction(undefined, 1)).toEqual({
            error: "Echec de la suppression du partenaire"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.revalidatePath).not.toHaveBeenCalled()
    })

    it("removes the logo, deletes the record and revalidates on the happy path", async () => {
        h.findUnique.mockResolvedValue(
            validPartenaireRecord({ id: 9, logoPath: "uuid-abc.png" })
        )
        const res = await deletePartenaireAction(undefined, 9)
        expect(res).toBeUndefined()
        expect(h.remove).toHaveBeenCalledWith(["uuid-abc.png"])
        expect(h.deleteFn).toHaveBeenCalledWith({ where: { id: 9 } })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/partenaires")
        expect(h.revalidatePath).toHaveBeenCalledWith("/a-propos/partenaires")
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
