import { beforeEach, describe, expect, it, vi } from "vitest"
import { assistanceConfigRecord } from "@/test/factories/assistance"
import { mockUser } from "@/test/factories/user"

const db = vi.hoisted(() => ({
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn()
}))
const auth = vi.hoisted(() => ({ getCurrentUserWithPermissions: vi.fn() }))
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }))

vi.mock("@/helpers/db", () => ({
    default: {
        assistanceConfig: {
            findFirst: db.findFirst,
            update: db.update,
            create: db.create
        }
    }
}))
vi.mock("@/helpers/supabase/auth", () => ({
    getCurrentUserWithPermissions: auth.getCurrentUserWithPermissions
}))
vi.mock("next/cache", () => ({ revalidatePath: cache.revalidatePath }))

import { updateAssistanceConfig } from "./actions"

const valid = { recipientEmail: "new@fare-asso.fr", delay: "24h" }

beforeEach(() => {
    db.findFirst.mockReset()
    db.update.mockReset()
    db.create.mockReset()
    auth.getCurrentUserWithPermissions.mockResolvedValue(
        mockUser(["access:defense-droits"])
    )
})

describe("updateAssistanceConfig — authorisation", () => {
    it("requires authentication", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(null)
        const res = await updateAssistanceConfig(valid)
        expect(res).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(db.update).not.toHaveBeenCalled()
    })

    it("requires the access:defense-droits permission", async () => {
        auth.getCurrentUserWithPermissions.mockResolvedValue(mockUser([]))
        const res = await updateAssistanceConfig(valid)
        expect(res.success).toBe(false)
        expect(db.update).not.toHaveBeenCalled()
        expect(db.create).not.toHaveBeenCalled()
    })
})

describe("updateAssistanceConfig — validation", () => {
    it("rejects an invalid recipient email", async () => {
        const res = await updateAssistanceConfig({
            recipientEmail: "not-an-email",
            delay: "24h"
        })
        expect(res.success).toBe(false)
        expect(db.update).not.toHaveBeenCalled()
    })

    it("rejects an empty delay", async () => {
        const res = await updateAssistanceConfig({
            recipientEmail: "ok@fare-asso.fr",
            delay: ""
        })
        expect(res.success).toBe(false)
    })
})

describe("updateAssistanceConfig — persistence", () => {
    it("updates the existing row and revalidates", async () => {
        db.findFirst.mockResolvedValue(assistanceConfigRecord({ id: 7 }))
        const res = await updateAssistanceConfig(valid)

        expect(res).toEqual({ success: true })
        expect(db.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: { recipientEmail: "new@fare-asso.fr", delay: "24h" }
        })
        expect(db.create).not.toHaveBeenCalled()
        expect(cache.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/defense-des-droits"
        )
    })

    it("creates the row when none exists", async () => {
        db.findFirst.mockResolvedValue(null)
        const res = await updateAssistanceConfig(valid)

        expect(res).toEqual({ success: true })
        expect(db.create).toHaveBeenCalledWith({
            data: { recipientEmail: "new@fare-asso.fr", delay: "24h" }
        })
        expect(db.update).not.toHaveBeenCalled()
    })
})
