import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("@/actions/espace-asso/createPasswordForRepresentativeAction", () => ({
    default: h.action
}))

import CreatePasswordForm from "../createPasswordForm"

const setInput = (root: HTMLElement, name: string, value: string): void => {
    const el = root.querySelector<HTMLInputElement>(`input[name="${name}"]`)
    if (!el) throw new Error(`input ${name} not found`)
    el.value = value
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<CreatePasswordForm />", () => {
    it("renders the password fields and the prefilled email", async () => {
        const screen = await render(
            <CreatePasswordForm email="rep@example.com" />
        )
        await expect
            .element(screen.getByRole("button", { name: /Valider/ }))
            .toBeVisible()
        const email = screen.baseElement.querySelector<HTMLInputElement>(
            'input[name="email"]'
        )
        expect(email?.value).toBe("rep@example.com")
    })

    it("submits the password form data to the action", async () => {
        const screen = await render(
            <CreatePasswordForm email="rep@example.com" />
        )
        setInput(screen.baseElement, "password", "supersecret")
        setInput(screen.baseElement, "passwordConf", "supersecret")
        await screen.getByRole("button", { name: /Valider/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const formData = h.action.mock.calls[0][1] as FormData
        expect(formData.get("password")).toBe("supersecret")
        expect(formData.get("passwordConf")).toBe("supersecret")
    })

    it("renders the error alert when the action fails", async () => {
        h.action.mockResolvedValue({ error: "Mot de passe non valide" })
        const screen = await render(
            <CreatePasswordForm email="rep@example.com" />
        )
        setInput(screen.baseElement, "password", "short")
        setInput(screen.baseElement, "passwordConf", "short")
        await screen.getByRole("button", { name: /Valider/ }).click()

        await expect
            .element(screen.getByText("Mot de passe non valide"))
            .toBeVisible()
    })
})
