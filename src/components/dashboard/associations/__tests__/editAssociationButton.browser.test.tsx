import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Association } from "@/generated/prisma/client"
import { renderWithClient as render } from "@/test/browser"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedLogo: new File([new Uint8Array([1, 2, 3])], "logo.png", {
        type: "image/png"
    })
}))

vi.mock("astro:actions", () => ({
    actions: { associations: { editAssociationAction: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({
        onEditChange
    }: {
        onEditChange?: (state: { file?: File; cleared: boolean }) => void
    }) => (
        <button
            type="button"
            onClick={() =>
                onEditChange?.({ file: h.pickedLogo, cleared: false })
            }
        >
            replace logo
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

import EditAssociationButton from "../editAssociationButton"

const association: Association = {
    id: 7,
    name: "AAEMR",
    major: "Médecine",
    desc: "Association des étudiant·e·s en médecine.",
    location: "6 Cours des Alliés, 35000 Rennes",
    discord: null,
    facebook: null,
    instagram: "https://www.instagram.com/aaemr",
    logoPath: "uuid-logo.png",
    twitter: null,
    website: null,
    birthdate: new Date("2015-06-01T00:00:00.000Z"),
    representativeId: null,
    email: "contact@aaemr.fr",
    officePath: null,
    approved: new Date("2020-01-01T00:00:00.000Z"),
    adhesionId: null
}

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(
        <EditAssociationButton
            association={association}
            logoUrl="https://example.com/logo.png"
        />
    )
    await screen.getByRole("button", { name: "Modifier" }).click()
    await expect
        .element(screen.getByRole("heading", { name: "Modifier Association" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<EditAssociationButton />", () => {
    it("prefills the fields from the association", async () => {
        const screen = await openDialog()
        await expect
            .element(screen.getByLabelText("Nom de l'association"))
            .toHaveValue("AAEMR")
        await expect
            .element(screen.getByLabelText("Filière"))
            .toHaveValue("Médecine")
        await expect
            .element(screen.getByLabelText("Lien Instagram (optionnel)"))
            .toHaveValue("https://www.instagram.com/aaemr")
        await expect.element(screen.getByText("1 juin 2015")).toBeVisible()
    })

    it("submits without a logo and lets the action keep the current one", async () => {
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: /^\s*Valider modifications\s*$/ })
            .click()
        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const formData = h.action.mock.calls[0][0] as FormData
        expect(formData.get("logo-picture")).toBeNull()
        expect(formData.get("id")).toBe("7")
    })

    it("submits the id and all social keys, allowing a link to be cleared", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "replace logo" }).click()
        await screen.getByLabelText("Nom de l'association").fill("AAEMR bis")
        await screen.getByLabelText("Lien Instagram (optionnel)").fill("")

        await screen
            .getByRole("button", { name: /^\s*Valider modifications\s*$/ })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const formData = h.action.mock.calls[0][0] as FormData
        expect(formData.get("id")).toBe("7")
        expect(formData.get("name")).toBe("AAEMR bis")
        expect(formData.get("logo-picture")).toBeInstanceOf(File)
        expect(formData.get("birthdate")).toBe("2015-06-01T00:00:00.000Z")
        // les liens sont toujours envoyés, même vides, pour pouvoir effacer
        expect(formData.get("instagram")).toBe("")
        expect(formData.get("website")).toBe("")
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            data: {
                success: false,
                error: "Vous n'avez pas la permission de modifier des associations"
            },
            error: undefined
        })
        const screen = await openDialog()

        await screen
            .getByRole("button", { name: /^\s*Valider modifications\s*$/ })
            .click()

        await expect
            .element(
                screen.getByText(
                    "Vous n'avez pas la permission de modifier des associations"
                )
            )
            .toBeVisible()
    })
})
