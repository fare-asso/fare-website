import { beforeEach, describe, expect, it, vi } from "vitest"

import { assistanceConfigRecord } from "@/test/factories/assistance"
import { dbModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findFirst: vi.fn(),
    create: vi.fn()
}))

vi.mock("@/helpers/db.server", () =>
    dbModule({
        assistanceConfig: { findFirst: h.findFirst, create: h.create }
    })
)

import { getAssistanceConfig } from "../assistanceConfig"

beforeEach(() => {
    h.findFirst.mockReset()
    h.create.mockReset()
})

describe("getAssistanceConfig", () => {
    it("returns the existing config without creating one", async () => {
        h.findFirst.mockResolvedValue(
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
        expect(h.create).not.toHaveBeenCalled()
    })

    it("creates a default config when none exists", async () => {
        h.findFirst.mockResolvedValue(null)
        h.create.mockResolvedValue(assistanceConfigRecord())

        const config = await getAssistanceConfig()

        expect(h.create).toHaveBeenCalledWith({ data: {} })
        expect(config).toEqual({
            recipientEmail: "defense-des-droits@fare-asso.fr",
            delay: "48h"
        })
    })
})
