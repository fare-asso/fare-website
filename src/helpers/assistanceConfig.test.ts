import { beforeEach, describe, expect, it, vi } from "vitest"
import { assistanceConfigRecord } from "@/test/factories/assistance"

const db = vi.hoisted(() => ({
    findFirst: vi.fn(),
    create: vi.fn()
}))

vi.mock("@/helpers/db", () => ({
    default: {
        assistanceConfig: { findFirst: db.findFirst, create: db.create }
    }
}))

import { getAssistanceConfig } from "./assistanceConfig"

beforeEach(() => {
    db.findFirst.mockReset()
    db.create.mockReset()
})

describe("getAssistanceConfig", () => {
    it("returns the existing config without creating one", async () => {
        db.findFirst.mockResolvedValue(
            assistanceConfigRecord({
                recipientEmail: "team@fare-asso.fr",
                delay: "24h"
            })
        )

        const config = await getAssistanceConfig()

        expect(config).toEqual({
            recipientEmail: "team@fare-asso.fr",
            delay: "24h"
        })
        expect(db.create).not.toHaveBeenCalled()
    })

    it("creates a default config when none exists", async () => {
        db.findFirst.mockResolvedValue(null)
        db.create.mockResolvedValue(assistanceConfigRecord())

        const config = await getAssistanceConfig()

        expect(db.create).toHaveBeenCalledWith({ data: {} })
        expect(config).toEqual({
            recipientEmail: "defense-des-droits@fare-asso.fr",
            delay: "48h"
        })
    })
})
