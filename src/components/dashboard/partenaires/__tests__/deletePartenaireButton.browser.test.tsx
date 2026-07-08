import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Partenaire } from "@/generated/prisma/client"
import { renderWithClient as render } from "@/test/browser"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { partenaires: { deletePartenaireAction: h.action } }
}))

import DeletePartenaireButton from "../deletePartenaireButton"

const partenaire: Partenaire = {
    id: 1,
    name: "ACME",
    description: "Description.",
    logoPath: "uuid-acme.png"
}

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<DeletePartenaireButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(
            <DeletePartenaireButton partenaire={partenaire} />
        )
        await expect.element(screen.getByRole("button").first()).toBeVisible()
    })

    it("opens the confirmation dialog with the partenaire name", async () => {
        const screen = await render(
            <DeletePartenaireButton partenaire={partenaire} />
        )
        await screen.getByRole("button").first().click()
        await expect
            .element(screen.getByText(/Voulez-vous vraiment supprimer/))
            .toBeVisible()
        await expect.element(screen.getByText("ACME")).toBeVisible()
    })

    it("cancels without invoking the action", async () => {
        const screen = await render(
            <DeletePartenaireButton partenaire={partenaire} />
        )
        await screen.getByRole("button").first().click()
        await screen.getByRole("button", { name: "Annuler" }).click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("invokes the delete action with the partenaire id on confirm", async () => {
        const screen = await render(
            <DeletePartenaireButton partenaire={{ ...partenaire, id: 42 }} />
        )
        await screen.getByRole("button").first().click()
        await screen.getByRole("button", { name: /Supprimer/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action.mock.calls[0][0]).toBe(42)
    })
})
