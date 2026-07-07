import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { validMemberRecord } from "@/test/factories/members"

const h = vi.hoisted(() => ({
    action: vi.fn(),
    pickedFile: new File([new Uint8Array([1, 2, 3])], "new-photo.png", {
        type: "image/png"
    })
}))

vi.mock("@/actions/members/editMemberAction", () => ({ default: h.action }))
vi.mock("@tanstack/react-router", () => ({
    useRouter: () => ({ invalidate: vi.fn() })
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({ onChange }: { onChange?: (file: File) => void }) => (
        <button type="button" onClick={() => onChange?.(h.pickedFile)}>
            choose photo
        </button>
    )
}))

import EditMemberButton from "../editMemberButton"

const member = validMemberRecord({ firstName: "Lea", lastName: "Martin" })

async function openDialog(): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<EditMemberButton member={member} />)
    await screen.getByRole("button").first().click()
    await expect
        .element(screen.getByRole("heading", { name: "Modifier Membre" }))
        .toBeVisible()
    return screen
}

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<EditMemberButton />", () => {
    it("pre-fills the form with the member's data", async () => {
        const screen = await openDialog()
        await expect.element(screen.getByLabelText("Prénom")).toHaveValue("Lea")
        await expect
            .element(screen.getByLabelText("Nom", { exact: true }))
            .toHaveValue("Martin")
    })

    it("submits the payload without a picture when none is picked", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Prénom").fill("Lou")
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toMatchObject({ id: 1, firstName: "Lou" })
        expect(submitted.picture).toBeUndefined()
    })

    it("submits the payload with a picture when one is picked", async () => {
        const screen = await openDialog()
        await screen.getByRole("button", { name: "choose photo" }).click()
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted.picture).toBeInstanceOf(File)
    })

    it("blocks an empty name submit and does not call the action", async () => {
        const screen = await openDialog()
        await screen.getByLabelText("Prénom").fill("")
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()
        expect(h.action).not.toHaveBeenCalled()
    })

    it("renders the server error when the action fails", async () => {
        h.action.mockResolvedValue({
            success: false,
            error: "Échec de la modification du membre."
        })
        const screen = await openDialog()
        await screen
            .getByRole("button", { name: "Valider les modifications" })
            .click()

        await expect
            .element(screen.getByText("Échec de la modification du membre."))
            .toBeVisible()
    })
})
