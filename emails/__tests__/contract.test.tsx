import { render } from "react-email"
import { describe, expect, it } from "vitest"

import BagadAssoContract from "../bagadasso/contract"

const data = {
    eventDate: new Date("2026-10-17T00:00:00Z"),
    eventEndDate: new Date("2026-10-18T00:00:00Z"),
    id: 67
}

describe("BagadAssoContract email", () => {
    it("omits communication resources and Canva but retains practical information when disabled", async () => {
        const html = await render(
            <BagadAssoContract
                data={{ ...data, includeCommunication: false }}
            />
        )
        expect(html).not.toContain("kit de communication")
        expect(html).not.toContain("canva.link")
        expect(html).not.toContain("modèles de communication")
        expect(html).not.toContain("conformément au contrat")
        expect(html).toContain("kit d&#x27;utilisation du Bagad&#x27;Asso")
        expect(html).toContain("campus de Beaulieu")
        expect(html).toContain("chèque de caution")
    })
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

    it("includes the supplied ticket number and resource links", async () => {
        const html = await render(<BagadAssoContract data={data} />)

        expect(html).toContain("Contrat Bagad&#x27;Asso #<!-- -->67")
        expect(html).toContain("kit d&#x27;utilisation du Bagad&#x27;Asso")
        expect(html).toContain("kit de communication")
        expect(html).toContain('href="https://canva.link/ge625su919wtyjz"')
    })
})
