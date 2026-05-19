import { render } from "react-email"
import { describe, expect, it } from "vitest"

import AdhesionAck from "../adhesion-acknowledgement"

describe("AdhesionAck email", () => {
    it("renders the association name and contact address", async () => {
        const html = await render(<AdhesionAck associationName="BDE Test" />)
        expect(html).toContain("BDE Test")
        expect(html).toContain("secretariat@fare-asso.fr")
    })
})
