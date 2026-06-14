import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedFile: new File([new Uint8Array([1, 2, 3])], "photo.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/members/addMemberAction", () => ({ default: h.action }))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({ onChange }: { onChange?: (file: File) => void }) => (
        <button type="button" onClick={() => onChange?.(h.pickedFile)}>
            choose photo
        </button>
    )
}))

import AddMemberButton from "../addMemberButton"

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<AddMemberButton />)
    await screen
        .getByRole("button", { name: "Ajouter un nouveau membre" })
        .click()
    await expect
        .element(screen.getByRole("heading", { name: "Nouveau Membre" }))
        .toBeVisible()
    return screen
}

async function fillValid(screen: Awaited<ReturnType<typeof render>>) {
    await screen.getByLabelText("Prénom").fill("Lea")
    await screen.getByLabelText("Nom", { exact: true }).fill("Martin")
    await screen.getByLabelText("Fonction").fill("Tresoriere")
    await screen.getByLabelText("Email").fill("lea@example.com")
    await screen.getByRole("button", { name: "choose photo" }).click()
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<AddMemberButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(<AddMemberButton />)
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Ajouter un nouveau membre"
                })
            )
            .toBeVisible()
    })

    it("opens the dialog when the trigger is clicked", async () => {
        const screen = await openDialog()
        await expect.element(screen.getByLabelText("Prénom")).toBeVisible()
        await expect.element(screen.getByLabelText("Email")).toBeVisible()
    })

    it("blocks an empty submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await openDialog()
        await fillValid(screen)
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toMatchObject({
            firstName: "Lea",
            lastName: "Martin",
            position: "Tresoriere",
            email: "lea@example.com"
        })
        expect(submitted.picture).toBeInstanceOf(File)
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            success: false,
            error: "Échec de l'upload de la photo."
        })
        const screen = await openDialog()
        await fillValid(screen)
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await expect
            .element(screen.getByText("Échec de l'upload de la photo."))
            .toBeVisible()
    })
})
