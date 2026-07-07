import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import type { Partenaire } from "@/generated/prisma/client"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedFile: new File([new Uint8Array([1, 2, 3])], "new-logo.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/partenaires/editPartenaireAction", () => ({
    editPartenaireAction: h.action
}))
vi.mock("@tanstack/react-router", () => ({
    useRouter: () => ({ invalidate: vi.fn() })
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
    h.action.mockResolvedValue({ success: true })
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
        const { data } = h.action.mock.calls[0][0] as { data: FormData }
        expect(data.get("id")).toBe("1")
        expect(data.get("name")).toBe("ACME 2")
        expect(data.get("description")).toBe("Description initiale.")
        expect(data.get("logo")).toBeNull()
    })

    it("submits the payload with a logo when one is picked", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const { data } = h.action.mock.calls[0][0] as { data: FormData }
        expect(data.get("logo")).toBeInstanceOf(File)
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
            success: false,
            error: "Échec de la modification du partenaire."
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
