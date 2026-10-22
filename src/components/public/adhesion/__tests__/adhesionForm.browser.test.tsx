import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { adhesion: { processAdhesion: h.action } }
}))
vi.mock("@/components/captcha", () => ({
    Captcha: () => null
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: () => null
}))
vi.mock("@/components/ui/location/locationPicker", () => ({
    default: () => null
}))

import { AdhesionForm } from "../adhesionForm"

function administratorCheckboxes(): HTMLButtonElement[] {
    return Array.from(
        document.querySelectorAll<HTMLButtonElement>(
            '[role="checkbox"][id^="bureau"]'
        )
    )
}

describe("<AdhesionForm /> bureau administrators", () => {
    it("disables additional administrators immediately and re-enables them after deselecting one", async () => {
        const screen = await render(<AdhesionForm />)

        await screen.getByRole("button", { name: "Ajouter un membre" }).click()
        await screen.getByRole("button", { name: "Ajouter un membre" }).click()

        await vi.waitFor(() => {
            expect(administratorCheckboxes()).toHaveLength(3)
        })
        const [first, second, third] = administratorCheckboxes()
        if (!first || !second || !third) {
            throw new Error("Expected three administrator checkboxes")
        }

        first.click()
        second.click()

        await vi.waitFor(() => expect(third.disabled).toBe(true))

        first.click()

        await vi.waitFor(() => expect(third.disabled).toBe(false))
    })
})
