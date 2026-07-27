import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { expectNoA11yViolations } from "@/test/a11y"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { bagadAsso: { submitSuggestionAction: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/captcha", () => ({
    Captcha: ({ onComplete }: { onComplete: (t: string) => void }) => (
        <button type="button" onClick={() => onComplete("token-123")}>
            solve captcha
        </button>
    )
}))

import SuggestionForm from "../suggestionForm"

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

async function fillValidForm(screen: Awaited<ReturnType<typeof render>>) {
    await screen.getByLabelText("Nom de l'article").fill("Vidéoprojecteur")
    await screen.getByLabelText("Type de matériel").click()
    await screen.getByRole("option", { name: "Son" }).click()
    await screen.getByLabelText("Nom de l'association").fill("FARE")
    await screen.getByLabelText("Prénom").fill("Anna")
    await screen.getByLabelText("Nom", { exact: true }).fill("Le Goff")
    await screen
        .getByLabelText("Rôle dans l'association")
        .fill("Responsable événementiel")
    await screen
        .getByLabelText("Email de contact (personnel ou de l'association)")
        .fill("contact@asso.fr")
    await screen.getByRole("button", { name: "solve captcha" }).click()
}

describe("<SuggestionForm />", () => {
    it("renders the suggestion form", async () => {
        const screen = await render(<SuggestionForm />)
        await expect
            .element(screen.getByText("Suggérer du matériel"))
            .toBeVisible()
        await expect
            .element(
                screen.getByRole("button", { name: "Envoyer la suggestion" })
            )
            .toBeVisible()
        await expectNoA11yViolations()
    })

    it("blocks an empty submit client-side and never calls the action", async () => {
        const screen = await render(<SuggestionForm />)
        await screen
            .getByRole("button", { name: "Envoyer la suggestion" })
            .click()
        expect(h.action).not.toHaveBeenCalled()
        await expect
            .element(
                screen.getByRole("button", { name: "Envoyer la suggestion" })
            )
            .toBeVisible()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await render(<SuggestionForm />)
        await fillValidForm(screen)
        await screen
            .getByRole("button", { name: "Envoyer la suggestion" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action.mock.calls[0][0]).toEqual({
            equipmentName: "Vidéoprojecteur",
            equipmentType: "son",
            referenceUrl: "",
            associationName: "FARE",
            firstName: "Anna",
            lastName: "Le Goff",
            position: "Responsable événementiel",
            contactEmail: "contact@asso.fr",
            details: "",
            captchaToken: "token-123"
        })
    })

    it("renders the success state when the action succeeds", async () => {
        const screen = await render(<SuggestionForm />)
        await fillValidForm(screen)
        await screen
            .getByRole("button", { name: "Envoyer la suggestion" })
            .click()

        await expect
            .element(screen.getByText("Merci pour votre suggestion !"))
            .toBeVisible()
    })

    it("renders the error alert when the action fails", async () => {
        h.action.mockResolvedValue({
            data: { success: false, error: "Échec de l'envoi" },
            error: undefined
        })
        const screen = await render(<SuggestionForm />)
        await fillValidForm(screen)
        await screen
            .getByRole("button", { name: "Envoyer la suggestion" })
            .click()

        await expect.element(screen.getByText("Échec de l'envoi")).toBeVisible()
    })
})
