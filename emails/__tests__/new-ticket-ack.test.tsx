import { render } from "react-email"
import { describe, expect, it } from "vitest"

import NewBagadAssoTicketAck from "../bagadasso/new-ticket-ack"

const data = {
    association: "BDE Test",
    eventDate: new Date("2026-09-01T00:00:00Z"),
    eventName: "Gala annuel",
    eventType: "Soirée",
    eventAddr: "1 rue de la Paix, Rennes",
    estimatedParticipants: 120,
    representativeEmail: "lea@example.com",
    equipments: [
        { name: "Barnum", quantity: 2 },
        { name: "Pack sono", quantity: 1 }
    ]
}

describe("NewBagadAssoTicketAck email", () => {
    it("renders each requested equipment with its quantity", async () => {
        const html = await render(<NewBagadAssoTicketAck data={data} />)
        // strip tags and react-email's `<!-- -->` text-node separators
        const text = html.replace(/<[^>]+>/g, "")
        expect(text).toContain("2x Barnum")
        expect(text).toContain("1x Pack sono")
        expect(text).toContain("Gala annuel")
        expect(text).toContain("lea@example.com")
    })

    it("shows the modification code only when a secret is provided", async () => {
        const withSecret = await render(
            <NewBagadAssoTicketAck data={{ ...data, secret: "abc-123" }} />
        )
        expect(withSecret).toContain("abc-123")

        const withoutSecret = await render(
            <NewBagadAssoTicketAck data={data} />
        )
        expect(withoutSecret).not.toContain("abc-123")
    })
})
