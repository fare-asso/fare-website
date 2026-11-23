import { render } from "react-email"
import { describe, expect, it } from "vitest"

import RemboursementAck from "../remboursement-acknowledgement"

describe("RemboursementAck email", () => {
    it("renders the requester first name and reimbursement type", async () => {
        const html = await render(
            <RemboursementAck prenom="Marie" type="voiture" />
        )
        expect(html).toContain("Marie")
        expect(html).toContain("un déplacement en voiture")
        expect(html).toContain("tresorerie@fare-asso.fr")
    })
})
