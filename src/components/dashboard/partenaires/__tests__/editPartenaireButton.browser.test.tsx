import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import type { Partenaire } from "@/generated/prisma/client"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedFile: new File([new Uint8Array([1, 2, 3])], "new-logo.png", {
        type: "image/png"
    })
}))

vi.mock("astro:actions", () => ({
    actions: { partenaires: { editPartenaireAction: h.action } }
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({ onChange }: { onChange?: (file: File) => void }) => (
        <button type="button" onClick={() => onChange?.(h.pickedFile)}>
            choose logo
        </button>
    )
}))

import EditPartenaireButton from "../editPartenaireButton"

const partenaire: Partenaire = {
    id: 1,
    name: "ACME",
    description: "Description initiale.",
    logoPath: "uuid-acme.png"
}

async function openDialog(
    p: Partenaire = partenaire
): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<EditPartenaireButton partenaire={p} />)
    await screen.getByRole("button").first().click()
    await expect
        .element(screen.getByRole("heading", { name: "Modifier Partenaire" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<EditPartenaireButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(
            <EditPartenaireButton partenaire={partenaire} />
        )
        await expect.element(screen.getByRole("button").first()).toBeVisible()
    })

    it("pre-fills the form with the partenaire's name and description", async () => {
        const screen = await openDialog()
        await expect
            .element(screen.getByLabelText("Nom du partenaire"))
            .toHaveValue("ACME")
        await expect
            .element(screen.getByLabelText("Description"))
            .toHaveValue("Description initiale.")
    })

    it("submits the payload without a logo when none is picked", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom du partenaire").fill("ACME 2")
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0] as FormData
        const payload = JSON.parse(submitted.get("payload") as string)
        expect(payload).toMatchObject({
            id: 1,
            name: "ACME 2",
            description: "Description initiale."
        })
        expect(submitted.get("logo")).toBeNull()
    })

    it("submits the payload with a logo when one is picked", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0] as FormData
        expect(submitted.get("logo")).toBeInstanceOf(File)
    })

    it("blocks an empty name submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom du partenaire").fill("")
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            data: {
                success: false,
                error: "Échec de la modification du partenaire."
            },
            error: undefined
        })
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await expect
            .element(
                screen.getByText("Échec de la modification du partenaire.")
            )
            .toBeVisible()
    })
})
