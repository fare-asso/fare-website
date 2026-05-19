import { render } from "@react-email/render"
import { describe, expect, it } from "vitest"

import AssistanceTemplate from "./assistance"

const base = {
    prenom: "Marie",
    nom: "Durand",
    email: "marie.durand@etudiant.fr",
    etablissement: "Université de Rennes",
    situationLabel: "À l'université / mon établissement",
    moyenContactLabel: "Email",
    message: "Bonjour, je rencontre une difficulte avec un examen.",
    hasAttachments: false
}

describe("AssistanceTemplate email", () => {
    it("renders the core fields", async () => {
        const html = await render(<AssistanceTemplate {...base} />)
        expect(html).toContain("Marie")
        expect(html).toContain("Durand")
        expect(html).toContain("marie.durand@etudiant.fr")
        expect(html).toContain("Université de Rennes")
        expect(html).toContain("université / mon établissement")
        expect(html).toContain(
            "Bonjour, je rencontre une difficulte avec un examen."
        )
    })

    it("shows the UFR and phone only when provided", async () => {
        const without = await render(<AssistanceTemplate {...base} />)
        expect(without).not.toContain("UFR / Composante")

        const withExtra = await render(
            <AssistanceTemplate
                {...base}
                ufr="UFR Droit"
                telephone="0612345678"
            />
        )
        expect(withExtra).toContain("UFR Droit")
        expect(withExtra).toContain("0612345678")
    })

    it("mentions attachments only when present", async () => {
        const without = await render(<AssistanceTemplate {...base} />)
        expect(without).not.toContain("pièces jointes")

        const withAtt = await render(
            <AssistanceTemplate {...base} hasAttachments />
        )
        expect(withAtt).toContain("pièces jointes")
    })
})
