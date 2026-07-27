import { describe, expect, it } from "vitest"

import { expectNoA11yViolations } from "@/test/a11y"
import { renderWithClient as render } from "@/test/browser"

import CalculateurBeneficiaire from "../calculateurBeneficiaire"

describe("<CalculateurBeneficiaire />", () => {
    it("renders the inputs and no result before both fields are filled", async () => {
        const screen = await render(<CalculateurBeneficiaire />)
        await expect
            .element(screen.getByLabelText("Recettes par mois (€)"))
            .toBeVisible()
        await expect
            .element(screen.getByLabelText("Dépenses par mois (€)"))
            .toBeVisible()
        await expect
            .element(
                screen.getByText(
                    "Remplis les deux champs pour voir ton résultat."
                )
            )
            .toBeVisible()
        await expectNoA11yViolations()
    })

    it("shows the 10€ basket at 1€ when the RAV is above 7,50€", async () => {
        const screen = await render(<CalculateurBeneficiaire />)
        await screen.getByLabelText("Recettes par mois (€)").fill("600")
        await screen.getByLabelText("Dépenses par mois (€)").fill("300")
        await expect
            .element(screen.getByText("10.00€", { exact: true }))
            .toBeVisible()
        await expect
            .element(screen.getByText("10€", { exact: true }))
            .toBeVisible()
        await expect
            .element(screen.getByText("1€", { exact: true }))
            .toBeVisible()
    })

    it("shows the up to 240€ basket for an intermediate RAV", async () => {
        const screen = await render(<CalculateurBeneficiaire />)
        await screen.getByLabelText("Recettes par mois (€)").fill("400")
        await screen.getByLabelText("Dépenses par mois (€)").fill("300")
        await expect
            .element(screen.getByText("3.33€", { exact: true }))
            .toBeVisible()
        await expect
            .element(screen.getByText("jusqu'à 240€", { exact: true }))
            .toBeVisible()
        await expect
            .element(screen.getByText("jusqu'à 24€", { exact: true }))
            .toBeVisible()
    })

    it("falls back to the empty state on a non-finite RAV", async () => {
        const screen = await render(<CalculateurBeneficiaire />)
        await screen.getByLabelText("Recettes par mois (€)").fill("1e999")
        await screen.getByLabelText("Dépenses par mois (€)").fill("300")
        await expect
            .element(
                screen.getByText(
                    "Remplis les deux champs pour voir ton résultat."
                )
            )
            .toBeVisible()
    })

    it("shows the free basket when the RAV is under 0,70€", async () => {
        const screen = await render(<CalculateurBeneficiaire />)
        await screen.getByLabelText("Recettes par mois (€)").fill("300")
        await screen.getByLabelText("Dépenses par mois (€)").fill("295")
        await expect
            .element(screen.getByText("selon le besoin", { exact: true }))
            .toBeVisible()
        await expect
            .element(screen.getByText("0€", { exact: true }))
            .toBeVisible()
    })
})
