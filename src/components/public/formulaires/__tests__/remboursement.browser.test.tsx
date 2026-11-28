import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { remboursement: { processRemboursement: h.action } },
    isInputError: () => false
}))
vi.mock("@/components/captcha", () => ({
    Captcha: ({ onComplete }: { onComplete: (t: string) => void }) => (
        <button type="button" onClick={() => onComplete("token-123")}>
            solve captcha
        </button>
    )
}))
vi.mock("@/components/ui/filepond", () => ({
    FilePondInput: ({
        name,
        onChange,
        onChangeMultiple
    }: {
        name?: string
        onChange?: (file: File) => void
        onChangeMultiple?: (files: File[]) => void
    }) => (
        <button
            type="button"
            onClick={() => {
                const file = new File([new Uint8Array([1])], `${name}.png`, {
                    type: "image/png"
                })
                onChange?.(file)
                onChangeMultiple?.([file])
            }}
        >
            add {name}
        </button>
    )
}))

import { expectNoA11yViolations } from "@/test/a11y"

import { RemboursementForm } from "../remboursement"

beforeEach(() => {
    h.action.mockResolvedValue({ data: { success: true }, error: undefined })
})

async function fillValidForm(
    screen: Awaited<ReturnType<typeof render>>,
    type: "train" | "voiture" | "metroBus" | "car" | "achat" = "train"
) {
    await screen.getByLabelText("Profil").click()
    await screen
        .getByRole("option", { name: "Administrateur·ice de la FARE" })
        .click()
    await screen.getByLabelText("Nom de votre association").fill("BDE Rennes")
    await screen.getByLabelText("Prénom").fill("Marie")
    await screen.getByLabelText("Nom", { exact: true }).fill("Dupont")
    await screen.getByLabelText("Email").fill("marie.durand@fare-asso.fr")
    await screen.getByLabelText("Téléphone").fill("0612345678")
    await screen.getByRole("button", { name: "add rib", exact: true }).click()
    await screen.getByLabelText("Type de remboursement").click()
    await screen.getByRole("option", { name: TYPES_LABELS[type] }).click()
    if (type === "train" || type === "voiture" || type === "car") {
        await screen.getByLabelText("Date du voyage").click()
        // react-day-picker v10 labels each day cell with its full localized
        // date (e.g. "dimanche 15 novembre 2026") instead of the bare number.
        await screen
            .getByRole("gridcell", { name: /\b15\b/ })
            .first()
            .click()
        await screen.getByLabelText("Point de départ").fill("Rennes")
        await screen.getByLabelText("Point d'arrivée").fill("Paris")
    }
    if (type === "voiture") {
        await screen
            .getByLabelText("Personnes dans le véhicule")
            .fill("Marie Durand (BDE Rennes)")
        await screen
            .getByRole("button", { name: "add justificatifsPassagers" })
            .click()
    }
    if (type === "achat") {
        await screen.getByLabelText("Objet de l'achat").fill("Affiches")
        await screen.getByLabelText("Montant TTC (en €)").fill("12,50")
    }
    await screen
        .getByRole("button", { name: "add justificatifs", exact: true })
        .click()
    await screen.getByRole("button", { name: "solve captcha" }).click()
}

const TYPES_LABELS = {
    train: "Déplacement en train",
    voiture: "Déplacement en voiture",
    metroBus: "Tickets de métro / bus",
    car: "Déplacement en car",
    achat: "Achat avec facture"
} as const

describe("<RemboursementForm />", () => {
    it("renders the base fields", async () => {
        const screen = await render(<RemboursementForm />)
        await expect.element(screen.getByLabelText("Profil")).toBeVisible()
        await expect.element(screen.getByLabelText("Email")).toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer ma demande" }))
            .toBeVisible()
        await expectNoA11yViolations()
    })

    it("blocks an empty submit client-side and does not call the action", async () => {
        const screen = await render(<RemboursementForm />)
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()
        expect(h.action).not.toHaveBeenCalled()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer ma demande" }))
            .toBeVisible()
    })

    it("only asks for the association when the requester is an administrateur·ice", async () => {
        const screen = await render(<RemboursementForm />)
        await screen.getByLabelText("Profil").click()
        await screen
            .getByRole("option", { name: "Membre du Bureau Territorial" })
            .click()
        await expect
            .element(screen.getByLabelText("Nom de votre association"))
            .not.toBeInTheDocument()
    })

    it("shows travel fields for a train request, none for an achat", async () => {
        const screen = await render(<RemboursementForm />)
        await screen.getByLabelText("Type de remboursement").click()
        await screen
            .getByRole("option", { name: "Déplacement en train" })
            .click()
        await expect
            .element(screen.getByLabelText("Date du voyage"))
            .toBeVisible()

        await screen.getByLabelText("Type de remboursement").click()
        await screen.getByRole("option", { name: "Achat avec facture" }).click()
        await expect
            .element(screen.getByLabelText("Date du voyage"))
            .not.toBeInTheDocument()
        await expect
            .element(screen.getByLabelText("Objet de l'achat"))
            .toBeVisible()
    })

    it("requires passenger proof only for a voiture request", async () => {
        const screen = await render(<RemboursementForm />)
        await screen.getByLabelText("Type de remboursement").click()
        await screen
            .getByRole("option", { name: "Déplacement en voiture" })
            .click()
        await expect
            .element(screen.getByLabelText("Personnes dans le véhicule"))
            .toBeVisible()
        await expect
            .element(
                screen.getByRole("button", {
                    name: "add justificatifsPassagers"
                })
            )
            .toBeVisible()

        await screen.getByLabelText("Type de remboursement").click()
        await screen.getByRole("option", { name: "Déplacement en car" }).click()
        await expect
            .element(screen.getByLabelText("Personnes dans le véhicule"))
            .not.toBeInTheDocument()
    })

    it("submits the parsed payload on a valid train form", async () => {
        const screen = await render(<RemboursementForm />)
        await fillValidForm(screen, "train")
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        expect(submitted).toBeInstanceOf(FormData)

        const payload = JSON.parse(submitted.get("payload") as string)
        expect(payload).toMatchObject({
            demandeur: "adminFARE",
            association: "BDE Rennes",
            prenom: "Marie",
            nom: "Dupont",
            email: "marie.durand@fare-asso.fr",
            telephone: "0612345678",
            type: "train",
            depart: "Rennes",
            arrivee: "Paris",
            captchaToken: "token-123"
        })
        expect(typeof payload.dateVoyage).toBe("string")
        expect(payload).not.toHaveProperty("objet")
        expect(payload).not.toHaveProperty("personnes")
        expect(submitted.get("rib")).toBeInstanceOf(File)
        expect(submitted.getAll("justificatifs[]")).toHaveLength(1)
    })

    it("submits passenger fields only on a voiture form", async () => {
        const screen = await render(<RemboursementForm />)
        await fillValidForm(screen, "voiture")
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        const payload = JSON.parse(submitted.get("payload") as string)
        expect(payload).toMatchObject({
            type: "voiture",
            personnes: "Marie Durand (BDE Rennes)"
        })
        expect(submitted.getAll("justificatifsPassagers[]")).toHaveLength(1)
    })

    it("submits achat fields and omits association for Bureau Territorial", async () => {
        const screen = await render(<RemboursementForm />)
        await fillValidForm(screen, "achat")
        await screen.getByLabelText("Profil").click()
        await screen
            .getByRole("option", { name: "Membre du Bureau Territorial" })
            .click()
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const submitted = h.action.mock.calls[0][0]
        const payload = JSON.parse(submitted.get("payload") as string)
        expect(payload).toMatchObject({
            demandeur: "bureauTerritorial",
            type: "achat",
            objet: "Affiches",
            montantTTC: "12,50"
        })
        expect(payload).not.toHaveProperty("association")
        expect(payload).not.toHaveProperty("dateVoyage")
    })

    it("renders the success state when the action succeeds", async () => {
        const screen = await render(<RemboursementForm />)
        await fillValidForm(screen, "metroBus")
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()

        await expect
            .element(screen.getByText("Demande bien reçue"))
            .toBeVisible()
    })

    it("renders the error alert when the action fails", async () => {
        h.action.mockResolvedValue({
            data: { success: false, error: "Échec de l'envoi" },
            error: undefined
        })
        const screen = await render(<RemboursementForm />)
        await fillValidForm(screen, "metroBus")
        await screen.getByRole("button", { name: "Envoyer ma demande" }).click()

        await expect.element(screen.getByText("Échec de l'envoi")).toBeVisible()
        await expect
            .element(screen.getByText("Demande bien reçue"))
            .not.toBeInTheDocument()
    })
})
