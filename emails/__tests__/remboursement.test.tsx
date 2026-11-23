import { render } from "react-email"
import { describe, expect, it } from "vitest"

import RemboursementTemplate from "../remboursement"

const base = {
    prenom: "Marie",
    nom: "Durand",
    email: "marie.durand@fare-asso.fr",
    demandeur: "adminFARE" as const,
    association: "BDE Rennes",
    type: "train" as const
}

describe("RemboursementTemplate email", () => {
    it("renders essential info and the dashboard link", async () => {
        const html = await render(<RemboursementTemplate {...base} />)
        expect(html).toContain("Marie")
        expect(html).toContain("Durand")
        expect(html).toContain("marie.durand@fare-asso.fr")
        expect(html).toContain("Administrateur·ice de la FARE")
        expect(html).toContain("BDE Rennes")
        expect(html).toContain("Déplacement en train")
        expect(html).toContain("/dashboard/remboursements")
    })

    it("hides association for Bureau Territorial", async () => {
        const html = await render(
            <RemboursementTemplate
                {...base}
                demandeur="bureauTerritorial"
                type="achat"
            />
        )
        expect(html).toContain("Membre du Bureau Territorial")
        expect(html).not.toContain("BDE Rennes")
        expect(html).toContain("Achat avec facture")
    })
})
