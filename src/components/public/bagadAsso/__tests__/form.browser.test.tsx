import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { bagadAsso: { submitBagadAssoFormAction: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/captcha", () => ({
    Captcha: ({ onComplete }: { onComplete: (t: string) => void }) => (
        <button type="button" onClick={() => onComplete("token-123")}>
            solve captcha
        </button>
    )
}))

import BagadAssoForm from "../form"

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<BagadAssoForm />", () => {
    it("renders the equipment-loan request form", async () => {
        const screen = await render(<BagadAssoForm equipmentList={[]} />)
        await expect
            .element(screen.getByText("Demande de prêt de matériel"))
            .toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer la demande" }))
            .toBeVisible()
    })

    it("blocks an empty submit client-side and never calls the action", async () => {
        const screen = await render(<BagadAssoForm equipmentList={[]} />)
        await screen.getByRole("button", { name: "Envoyer la demande" }).click()
        expect(h.action).not.toHaveBeenCalled()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer la demande" }))
            .toBeVisible()
    })
})
