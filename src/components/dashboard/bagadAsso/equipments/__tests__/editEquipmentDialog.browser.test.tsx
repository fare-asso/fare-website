import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import type { BagadAssoEquipment } from "@/generated/prisma/client"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedImage: new File([new Uint8Array([1, 2, 3])], "new.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/bagadAsso/editEquipmentAction", () => ({
    default: h.action
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({
        onEditChange
    }: {
        onEditChange?: (state: { file?: File; cleared: boolean }) => void
    }) => (
        <div>
            <button
                type="button"
                onClick={() =>
                    onEditChange?.({ file: h.pickedImage, cleared: false })
                }
            >
                choose image
            </button>
            <button
                type="button"
                onClick={() =>
                    onEditChange?.({ file: undefined, cleared: true })
                }
            >
                remove image
            </button>
        </div>
    )
}))

import EditEquipmentDialog from "../editEquipmentDialog"

const equipment: BagadAssoEquipment = {
    id: 7,
    name: "Barnum 3×6m",
    imagePath: "barnum.png",
    deposit: 50,
    quantity: 3
}

async function openDialog(
    imageUrl: string | null = "https://cdn.test/barnum.png"
): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(
        <EditEquipmentDialog equipment={equipment} currentImageUrl={imageUrl} />
    )
    await screen.getByRole("button", { name: "Modifier" }).click()
    await expect
        .element(screen.getByRole("heading", { name: "Modifier l'équipement" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<EditEquipmentDialog />", () => {
    it("prefills the form with the equipment values", async () => {
        const screen = await openDialog()
        await expect
            .element(screen.getByLabelText("Nom"))
            .toHaveValue("Barnum 3×6m")
    })

    it("submits the edited payload, keeping the current image", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom").fill("Barnum modifié")
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action.mock.calls[0][0]).toMatchObject({
            id: 7,
            name: "Barnum modifié",
            quantity: 3,
            deposit: 50,
            removeImage: false
        })
    })

    it("flags the image for removal when it is cleared", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "remove image" }).click()
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action.mock.calls[0][0]).toMatchObject({ removeImage: true })
    })

    it("passes the chosen file on the payload", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "choose image" }).click()
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action.mock.calls[0][0].image).toBeInstanceOf(File)
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            success: false,
            error: "Echec de la modification de l'équipement. Veuillez réessayer."
        })
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: /^\s*Enregistrer\s*$/ })
            .click()

        await expect
            .element(
                screen.getByText(
                    "Echec de la modification de l'équipement. Veuillez réessayer."
                )
            )
            .toBeVisible()
    })
})
