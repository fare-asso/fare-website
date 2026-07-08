import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { links: { addLinkAction: h.action } }
}))

import AddLinkButton from "../addLinkButton"

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(
        <AddLinkButton categoryId={3} first={false} files={{}} />
    )
    await screen.getByRole("button", { name: "Ajouter un lien" }).click()
    await expect
        .element(screen.getByRole("heading", { name: "Nouveau lien" }))
        .toBeVisible()
    return screen
}

async function fillValidForm(
    screen: Awaited<ReturnType<typeof render>>
): Promise<void> {
    await screen.getByLabelText("Libellé").fill("Notre Instagram")
    await screen
        .getByLabelText("URL")
        .fill("https://instagram.com/fare_hautebretagne")
}

beforeEach(() => {
    h.action.mockReset()
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<AddLinkButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(
            <AddLinkButton categoryId={3} first={false} files={{}} />
        )
        await expect
            .element(screen.getByRole("button", { name: "Ajouter un lien" }))
            .toBeVisible()
    })

    it("renders the 'premier lien' label for an empty category", async () => {
        const screen = await render(
            <AddLinkButton categoryId={3} first={true} files={{}} />
        )
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Ajouter un premier lien"
                })
            )
            .toBeVisible()
    })

    it("blocks an empty submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()
        await expect
            .element(screen.getByText("URL requise").first())
            .toBeVisible()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("blocks submit and shows 'URL invalide' for a bad url", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Libellé").fill("Notre Instagram")
        await screen.getByLabelText("URL").fill("pas-une-url")
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()
        await expect
            .element(screen.getByText("URL invalide").first())
            .toBeVisible()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await openDialog()
        await fillValidForm(screen)
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action).toHaveBeenCalledWith({
            categoryId: 3,
            label: "Notre Instagram",
            url: "https://instagram.com/fare_hautebretagne"
        })
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            data: {
                success: false,
                error: "Échec de la création du lien."
            },
            error: undefined
        })
        const screen = await openDialog()
        await fillValidForm(screen)
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await expect
            .element(screen.getByText("Échec de la création du lien."))
            .toBeVisible()
    })
})
