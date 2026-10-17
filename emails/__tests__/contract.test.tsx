import { render } from "react-email"
import { describe, expect, it } from "vitest"

import BagadAssoContract from "../bagadasso/contract"

const data = {
    eventDate: new Date("2026-10-17T00:00:00Z"),
    eventEndDate: new Date("2026-10-18T00:00:00Z")
}

describe("BagadAssoContract email", () => {
    it("renders the event dates and contract instructions", async () => {
        const html = await render(<BagadAssoContract data={data} />)

        expect(html).toContain(
            "Du samedi 17 octobre 2026 au dimanche 18 octobre 2026"
        )
        expect(html).toContain("chèque de caution")
        expect(html).toContain("campus de Beaulieu")
    })

    it("renders a single date when the event has no end date", async () => {
        const html = await render(
            <BagadAssoContract data={{ ...data, eventEndDate: null }} />
        )

        expect(html).toContain("samedi 17 octobre 2026")
        expect(html).not.toContain("Du samedi 17 octobre 2026")
    })

    it("links to placeholder resources until final URLs are supplied", async () => {
        const html = await render(<BagadAssoContract data={data} />)

        for (const label of [
            "contrat",
            "kit d&#x27;utilisation du Bagad&#x27;Asso",
            "kit de communication",
            "https://example.com"
        ]) {
            expect(html).toMatch(
                new RegExp(`href="https://example.com"[^>]*>${label}<`)
            )
        }
    })
})
