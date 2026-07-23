import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithClient as render } from "@/test/browser"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedLogo: new File([new Uint8Array([1, 2, 3])], "logo.png", {
        type: "image/png"
    })
}))

vi.mock("astro:actions", () => ({
    actions: { associations: { addAssociationAction: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({ onChange }: { onChange?: (file: File) => void }) => (
        <button type="button" onClick={() => onChange?.(h.pickedLogo)}>
            choose logo
        </button>
    )
}))
vi.mock("@/components/ui/calendar", () => ({
    Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) => (
        <button
            type="button"
            onClick={() => onSelect?.(new Date("2015-06-01T00:00:00.000Z"))}
        >
            pick date
        </button>
    )
}))
vi.mock("@/components/ui/location/locationPicker", () => ({
    default: ({
        id,
        value,
        onChange
    }: {
        id?: string
        value?: string
        onChange?: (value: string) => void
    }) => (
        <input
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    )
}))

import AddAssociationButton from "../addAssociationButton"

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<AddAssociationButton />)
    await screen
        .getByRole("button", { name: "Ajouter une nouvelle association" })
        .click()
    await expect
        .element(screen.getByRole("heading", { name: "Nouvelle Association" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<AddAssociationButton />", () => {
    it("renders the trigger button", async () => {
        const screen = await render(<AddAssociationButton />)
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Ajouter une nouvelle association"
                })
            )
            .toBeVisible()
    })

    it("opens the dialog with its fields", async () => {
        const screen = await openDialog()
        await expect
            .element(screen.getByLabelText("Nom de l'association"))
            .toBeVisible()
        await expect.element(screen.getByLabelText("Filière")).toBeVisible()
        await expect.element(screen.getByLabelText("Description")).toBeVisible()
        await expect
            .element(screen.getByLabelText("Adresse du local"))
            .toBeVisible()
        await expect
            .element(screen.getByLabelText("Email de contact"))
            .toBeVisible()
    })

    it("blocks an empty submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("submits a FormData with the legacy field names", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Nom de l'association").fill("AAEMR")
        await screen.getByLabelText("Filière").fill("Médecine")
        await screen.getByLabelText("Description").fill("Une association.")
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen.getByText("Sélectionnez une date").click()
        await screen.getByRole("button", { name: "pick date" }).click()
        await screen
            .getByLabelText("Adresse du local")
            .fill("6 Cours des Alliés, 35000 Rennes")
        await screen.getByLabelText("Email de contact").fill("contact@asso.fr")
        await screen
            .getByLabelText("Site internet (optionnel)")
            .fill("https://www.fare-asso.fr")

        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const formData = h.action.mock.calls[0][0] as FormData
        expect(formData.get("name")).toBe("AAEMR")
        expect(formData.get("major")).toBe("Médecine")
        expect(formData.get("description")).toBe("Une association.")
        expect(formData.get("logo-picture")).toBeInstanceOf(File)
        expect(formData.get("birthdate")).toBe("2015-06-01T00:00:00.000Z")
        expect(formData.get("location")).toBe(
            "6 Cours des Alliés, 35000 Rennes"
        )
        expect(formData.get("email")).toBe("contact@asso.fr")
        expect(formData.get("website")).toBe("https://www.fare-asso.fr")
        // les liens optionnels vides ne sont pas envoyés
        expect(formData.get("facebook")).toBeNull()
        expect(formData.get("instagram")).toBeNull()
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            data: {
                success: false,
                error: "Vous n'avez pas la permission de créer des associations"
            },
            error: undefined
        })
        const screen = await openDialog()
        await screen.getByLabelText("Nom de l'association").fill("AAEMR")
        await screen.getByLabelText("Filière").fill("Médecine")
        await screen.getByLabelText("Description").fill("Une association.")
        await screen.getByRole("button", { name: "choose logo" }).click()
        await screen.getByText("Sélectionnez une date").click()
        await screen.getByRole("button", { name: "pick date" }).click()
        await screen
            .getByLabelText("Adresse du local")
            .fill("6 Cours des Alliés, 35000 Rennes")
        await screen.getByLabelText("Email de contact").fill("contact@asso.fr")

        await screen.getByRole("button", { name: /^\s*Ajouter\s*$/ }).click()

        await expect
            .element(
                screen.getByText(
                    "Vous n'avez pas la permission de créer des associations"
                )
            )
            .toBeVisible()
    })
})
