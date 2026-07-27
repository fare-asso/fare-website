import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { Field, FieldError, FieldLabel } from "../field"
import { Input } from "../input"

function TestField({
    invalid = false,
    optional = false
}: {
    invalid?: boolean
    optional?: boolean
}) {
    return (
        <Field data-invalid={invalid} optional={optional}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" aria-invalid={invalid} />
            {invalid && <FieldError>Champ invalide</FieldError>}
        </Field>
    )
}

const input = (): HTMLElement | null => document.querySelector("input#email")

describe("<Field /> a11y wiring", () => {
    it("links the control to the error via aria-describedby when invalid", async () => {
        await render(<TestField invalid />)
        const describedBy = input()?.getAttribute("aria-describedby")
        expect(describedBy).toBeTruthy()
        expect(
            document.getElementById(describedBy as string)?.textContent
        ).toContain("Champ invalide")
    })

    it("removes aria-describedby when the field becomes valid", async () => {
        const screen = await render(<TestField invalid />)
        expect(input()?.getAttribute("aria-describedby")).toBeTruthy()
        await screen.rerender(<TestField />)
        await vi.waitFor(() =>
            expect(input()?.getAttribute("aria-describedby")).toBeNull()
        )
    })

    it("marks controls required by default, unless the Field is optional", async () => {
        const screen = await render(<TestField />)
        expect(input()?.getAttribute("aria-required")).toBe("true")
        await screen.rerender(<TestField optional />)
        await vi.waitFor(() =>
            expect(input()?.getAttribute("aria-required")).toBeNull()
        )
    })
})
