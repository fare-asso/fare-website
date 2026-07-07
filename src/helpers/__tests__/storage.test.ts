import { beforeAll, describe, expect, it, vi } from "vitest"

import { uniqueFileName } from "../storage"

beforeAll(() => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
        "abcd1234-0000-0000-0000-000000000000"
    )
})

describe("uniqueFileName", () => {
    it("keeps alphanumerics, dashes and underscores", () => {
        expect(uniqueFileName("logo_v2-final.webp")).toBe(
            "logo_v2-final-abcd1234.webp"
        )
    })

    it("replaces disallowed characters with a dash and lowercases the extension", () => {
        expect(uniqueFileName("My Photo!.PNG")).toBe("My-Photo-abcd1234.png")
    })

    it("strips accents and collapses runs of disallowed characters", () => {
        expect(uniqueFileName("résumé final.jpeg")).toBe(
            "r-sum-final-abcd1234.jpeg"
        )
    })

    it("falls back to defaults for an empty base or missing extension", () => {
        expect(uniqueFileName("???")).toBe("file-abcd1234.bin")
        expect(uniqueFileName("photo")).toBe("photo-abcd1234.bin")
    })
})
