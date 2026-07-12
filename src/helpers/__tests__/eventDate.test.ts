import { describe, expect, it } from "vitest"

import {
    formatEventDate,
    formatEventDateRange,
    formatEventDateRangeCompact,
    toUtcMidnight
} from "../eventDate"

describe("formatEventDate", () => {
    it("formats a UTC-midnight day in Europe/Paris", () => {
        expect(formatEventDate(new Date("2026-07-24T00:00:00Z"))).toBe(
            "vendredi 24 juillet 2026"
        )
    })

    it("keeps legacy Paris-midnight dates on the picked day", () => {
        // Stored before UTC normalization: picked July 24 in Paris (UTC+2)
        expect(formatEventDate(new Date("2026-07-23T22:00:00Z"))).toBe(
            "vendredi 24 juillet 2026"
        )
    })
})

describe("formatEventDateRange", () => {
    it("returns a single date when there is no end date", () => {
        expect(
            formatEventDateRange(new Date("2026-07-24T00:00:00Z"), null)
        ).toBe("vendredi 24 juillet 2026")
    })

    it("collapses a same-day range to a single date", () => {
        expect(
            formatEventDateRange(
                new Date("2026-07-24T00:00:00Z"),
                new Date("2026-07-24T00:00:00Z")
            )
        ).toBe("vendredi 24 juillet 2026")
    })

    it("formats a multi-day range", () => {
        expect(
            formatEventDateRange(
                new Date("2026-07-24T00:00:00Z"),
                new Date("2026-07-26T00:00:00Z")
            )
        ).toBe("Du vendredi 24 juillet 2026 au dimanche 26 juillet 2026")
    })
})

describe("formatEventDateRangeCompact", () => {
    it("formats a range on a single line with shared parts collapsed", () => {
        const range = formatEventDateRangeCompact(
            new Date("2026-07-17T00:00:00Z"),
            new Date("2026-07-18T00:00:00Z")
        )
        // ICU may use thin spaces around the dash depending on the runtime
        expect(range.replace(/\s/g, " ")).toBe("ven. 17 – sam. 18 juillet 2026")
    })

    it("returns a single date when there is no end date or it is the same day", () => {
        expect(
            formatEventDateRangeCompact(new Date("2026-07-17T00:00:00Z"), null)
        ).toBe("ven. 17 juillet 2026")
        expect(
            formatEventDateRangeCompact(
                new Date("2026-07-17T00:00:00Z"),
                new Date("2026-07-17T00:00:00Z")
            )
        ).toBe("ven. 17 juillet 2026")
    })
})

describe("toUtcMidnight", () => {
    it("maps a local calendar day to UTC midnight", () => {
        const picked = new Date(2026, 6, 24) // local midnight, July 24
        expect(toUtcMidnight(picked).toISOString()).toBe(
            "2026-07-24T00:00:00.000Z"
        )
    })
})
