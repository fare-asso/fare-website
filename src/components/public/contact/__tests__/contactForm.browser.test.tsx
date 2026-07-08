import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { contact: { submitContactFormAction: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/captcha", () => ({
    Captcha: ({ onComplete }: { onComplete: (t: string) => void }) => (
        <button type="button" onClick={() => onComplete("token-123")}>
            solve captcha
        </button>
    )
}))

import ContactForm from "../contactForm"

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<ContactForm />", () => {
    it("renders the contact fields", async () => {
        const screen = await render(<ContactForm />)
        await expect.element(screen.getByLabelText("Prénom")).toBeVisible()
        await expect.element(screen.getByLabelText("Email")).toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer" }))
            .toBeVisible()
    })

    it("blocks an empty submit client-side and does not call the action", async () => {
        const screen = await render(<ContactForm />)
        await screen.getByRole("button", { name: "Envoyer" }).click()
        // The action is never reached and the form stays on screen.
        expect(h.action).not.toHaveBeenCalled()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer" }))
            .toBeVisible()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await render(<ContactForm />)
        await screen.getByLabelText("Prénom").fill("Jean")
        await screen.getByLabelText("Nom", { exact: true }).fill("Dupont")
        await screen.getByLabelText("Email").fill("jean@example.com")
        await screen.getByLabelText("Message").fill("Bonjour, une question.")
        await screen.getByRole("button", { name: "solve captcha" }).click()
        await screen.getByRole("button", { name: "Envoyer" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toEqual({
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean@example.com",
            message: "Bonjour, une question.",
            captchaToken: "token-123"
        })
    })

    it("renders the success state when the action succeeds", async () => {
        const screen = await render(<ContactForm />)
        await screen.getByLabelText("Prénom").fill("Jean")
        await screen.getByLabelText("Nom", { exact: true }).fill("Dupont")
        await screen.getByLabelText("Email").fill("jean@example.com")
        await screen.getByLabelText("Message").fill("Bonjour, une question.")
        await screen.getByRole("button", { name: "solve captcha" }).click()
        await screen.getByRole("button", { name: "Envoyer" }).click()

        await expect.element(screen.getByText("Message envoyé")).toBeVisible()
    })

    it("renders the error alert when the action fails", async () => {
        h.action.mockResolvedValue({
            data: { error: "Échec de l'envoi" },
            error: undefined
        })
        const screen = await render(<ContactForm />)
        await screen.getByLabelText("Prénom").fill("Jean")
        await screen.getByLabelText("Nom", { exact: true }).fill("Dupont")
        await screen.getByLabelText("Email").fill("jean@example.com")
        await screen.getByLabelText("Message").fill("Bonjour, une question.")
        await screen.getByRole("button", { name: "solve captcha" }).click()
        await screen.getByRole("button", { name: "Envoyer" }).click()

        await expect.element(screen.getByText("Échec de l'envoi")).toBeVisible()
    })
})
