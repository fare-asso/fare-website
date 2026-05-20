import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedFile: new File([new Uint8Array([1, 2, 3])], "logo.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/partenaires/addPartenaireAction", () => ({
    default: h.action
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({
        onChange
    }: {
        onChange?: (file: File) => void
    }) => (
        <button
            type="button"
            onClick={() => onChange?.(h.pickedFile)}
        >
            choose logo
        </button>
    )
}))

import AddPartenaireButton from "../addPartenaireButton"

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<AddPartenaireButton />)
    await screen
        .getByRole("button", { name: "Ajouter un Nouveau Partenaire" })
        .click()
    await expect
        .element(screen.getByRole("heading", { name: "Nouveau Partenaire" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<AddPartenaireButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(<AddPartenaireButton />)
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Ajouter un Nouveau Partenaire"
                })
            )
            .toBeVisible()
    })

    it("opens the dialog when the trigger is clicked", async () => {
        const screen = await openDialog()
        await expect
            .element(screen.getByLabelText("Nom du partenaire"))
            .toBeVisible()
        await expect
            .element(screen.getByLabelText("Description"))
            .toBeVisible()
        await expect
            .element(screen.getByText("Logo", { exact: true }))
            .toBeVisible()
    })

    it("blocks an empty submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: /^\s*Ajouter\s*$/ })
            .click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom du partenaire").fill("ACME")
        await screen
            .getByLabelText("Description")
            .fill("Un partenaire de la Federation.")
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen
            .getByRole("button", { name: /^\s*Ajouter\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toMatchObject({
            name: "ACME",
            description: "Un partenaire de la Federation."
        })
        expect(submitted.logo).toBeInstanceOf(File)
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            success: false,
            error: "Échec de l'upload du logo."
        })
        const screen = await openDialog()
        await screen.getByLabelText("Nom du partenaire").fill("ACME")
        await screen
            .getByLabelText("Description")
            .fill("Un partenaire de la Federation.")
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen
            .getByRole("button", { name: /^\s*Ajouter\s*$/ })
            .click()

        await expect
            .element(screen.getByText("Échec de l'upload du logo."))
            .toBeVisible()
    })
})
