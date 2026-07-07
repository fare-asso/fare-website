import { beforeEach, describe, expect, it, vi } from "vitest"

import { mockUser } from "@/test/factories/user"
import { authModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db.server", () => dbModule({ user: { update: h.update } }))
vi.mock("@/helpers/supabase/auth.server", () => authModule(h.getUser))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import {
    generateBagadCalendarTokenAction,
    revokeBagadCalendarTokenAction
} from "../calendarTokenAction"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["access:bagad-asso"]))
    h.update.mockResolvedValue({ id: "user-1" })
})

describe("generateBagadCalendarTokenAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await generateBagadCalendarTokenAction()).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("requires the access:bagad-asso permission", async () => {
        h.getUser.mockResolvedValue(mockUser([]))
        const res = await generateBagadCalendarTokenAction()
        expect(res.success).toBe(false)
        if (!res.success) expect(res.error).toMatch(/permission/)
        expect(h.update).not.toHaveBeenCalled()
    })

    it("generates a url-safe token, persists it and revalidates", async () => {
        const res = await generateBagadCalendarTokenAction()
        if (!res.success) throw new Error("expected success")
        expect(res.value).toMatch(/^[A-Za-z0-9_-]+$/)
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "user-1" },
            data: { calendarToken: res.value }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await generateBagadCalendarTokenAction()).toEqual({
            success: false,
            error: "Echec de la génération du lien"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})

describe("revokeBagadCalendarTokenAction", () => {
    it("requires authentication", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await revokeBagadCalendarTokenAction()).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.update).not.toHaveBeenCalled()
    })

    it("clears the token and revalidates", async () => {
        expect(await revokeBagadCalendarTokenAction()).toEqual({
            success: true
        })
        expect(h.update).toHaveBeenCalledWith({
            where: { id: "user-1" },
            data: { calendarToken: null }
        })
    })

    it("captures and returns an error when the update throws", async () => {
        h.update.mockRejectedValue(new Error("db down"))
        expect(await revokeBagadCalendarTokenAction()).toEqual({
            success: false,
            error: "Echec de la révocation du lien"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })
})
