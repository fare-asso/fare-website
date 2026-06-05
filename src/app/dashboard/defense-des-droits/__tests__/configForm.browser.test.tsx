import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn()
}))

vi.mock("@/app/dashboard/defense-des-droits/actions", () => ({
    updateAssistanceConfig: h.action
}))
vi.mock("sonner", () => ({
    toast: { success: h.toastSuccess, error: h.toastError }
}))

import ConfigForm from "../configForm"

beforeEach(() => {
    vi.clearAllMocks()
    h.action.mockResolvedValue({ success: true })
})

describe("<ConfigForm />", () => {
    it("renders the fields prefilled and the submit button", async () => {
        const screen = await render(
            <ConfigForm recipientEmail="x@fare-asso.fr" delay="48h" />
        )
        await expect
            .element(screen.getByLabelText("Adresse de réception des demandes"))
            .toHaveValue("x@fare-asso.fr")
        await expect
            .element(screen.getByLabelText("Délai de réponse annoncé"))
            .toHaveValue("48h")
        await expect
            .element(screen.getByRole("button", { name: "Enregistrer" }))
            .toBeVisible()
    })

    it("submits the edited config and toasts success", async () => {
        const screen = await render(
            <ConfigForm recipientEmail="x@fare-asso.fr" delay="48h" />
        )
        const email = screen.getByLabelText("Adresse de réception des demandes")
        await email.clear()
        await email.fill("new@fare-asso.fr")
        const delay = screen.getByLabelText("Délai de réponse annoncé")
        await delay.clear()
        await delay.fill("72h")
        await screen.getByRole("button", { name: "Enregistrer" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action).toHaveBeenCalledWith({
            recipientEmail: "new@fare-asso.fr",
            delay: "72h"
        })
        await vi.waitFor(() =>
            expect(h.toastSuccess).toHaveBeenCalledWith(
                "La configuration a bien été enregistrée."
            )
        )
    })

    it("toasts an error when the action fails", async () => {
        h.action.mockResolvedValue({ success: false, error: "Boum" })
        const screen = await render(
            <ConfigForm recipientEmail="x@fare-asso.fr" delay="48h" />
        )
        await screen.getByRole("button", { name: "Enregistrer" }).click()

        await vi.waitFor(() =>
            expect(h.toastError).toHaveBeenCalledWith("Boum")
        )
    })
})
