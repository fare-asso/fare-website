import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedImage: new File([new Uint8Array([1, 2, 3])], "tent.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/bagadAsso/addEquipmentAction", () => ({ default: h.action }))
vi.mock("@tanstack/react-router", () => ({
    useRouter: () => ({ invalidate: vi.fn() })
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({ onChange }: { onChange?: (file: File) => void }) => (
        <button type="button" onClick={() => onChange?.(h.pickedImage)}>
            choose image
        </button>
    )
}))

import AddEquipmentButton from "../addEquipmentButton"

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<AddEquipmentButton />)
    await screen.getByRole("button", { name: "Ajouter du matériel" }).click()
    await expect
        .element(screen.getByRole("heading", { name: "Nouveau matériel" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<AddEquipmentButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(<AddEquipmentButton />)
        await expect
            .element(
                screen.getByRole("button", { name: "Ajouter du matériel" })
            )
            .toBeVisible()
    })

    it("opens the dialog with its fields", async () => {
        const screen = await openDialog()
        await expect.element(screen.getByLabelText("Nom")).toBeVisible()
        await expect.element(screen.getByLabelText("Quantité")).toBeVisible()
        await expect
            .element(screen.getByLabelText("Caution (par objet)"))
            .toBeVisible()
    })

    it("blocks an empty submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("submits the parsed payload on a valid form", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom").fill("Barnum 3×6m")
        await screen.getByRole("button", { name: "choose image" }).click()
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toMatchObject({
            name: "Barnum 3×6m",
            quantity: 1,
            deposit: 0
        })
        expect(submitted.image).toBeInstanceOf(File)
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            success: false,
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        })
        const screen = await openDialog()
        await screen.getByLabelText("Nom").fill("Barnum")
        await screen.getByRole("button", { name: "choose image" }).click()
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await expect
            .element(
                screen.getByText(
                    "Echec de l'ajout de l'équipement. Veuillez réessayer."
                )
            )
            .toBeVisible()
    })
})
