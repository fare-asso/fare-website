import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithClient as render } from "@/test/browser"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

const h = vi.hoisted(() => ({
    send: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    remove: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
}))

vi.mock("astro:actions", () => ({
    actions: {
        bagadAsso: {
            sendContractAction: h.send,
            deleteBagadAssoTicketAction: h.archive,
            unarchiveBagadAssoTicketAction: h.unarchive,
            hardDeleteBagadAssoTicketAction: h.remove
        }
    }
}))
vi.mock("sonner", () => ({ toast: { success: h.success, error: h.error } }))

import TicketActions from "../ticketActions"
import { TicketProvider, useTicketContext } from "../ticketContext"

function EquipmentBusyControl(): ReactNode {
    const { isEquipmentBusy, setIsEquipmentBusy } = useTicketContext()
    return (
        <button
            type="button"
            onClick={(): void => setIsEquipmentBusy(!isEquipmentBusy)}
        >
            Toggle quantity editing
        </button>
    )
}

async function renderActions(
    checked = true,
    archived = false,
    canDelete = false
): Promise<Awaited<ReturnType<typeof render>>> {
    return render(
        <TicketProvider
            ticket={bagadAssoTicketRecord({
                deleted: archived ? new Date() : null
            })}
            allEquipments={[
                {
                    id: 1,
                    name: "Barnum",
                    quantity: 2,
                    deposit: 50,
                    imagePath: undefined,
                    checked
                },
                {
                    id: 2,
                    name: "Table",
                    quantity: 1,
                    deposit: 25,
                    imagePath: undefined,
                    checked: false
                }
            ]}
            totalDeposit={125}
            canEditTicket
            canDeleteTicket={canDelete}
        >
            <TicketActions />
            <EquipmentBusyControl />
        </TicketProvider>
    )
}

beforeEach(() => {
    h.send.mockResolvedValue({ data: { success: true }, error: undefined })
    h.archive.mockResolvedValue({ data: { success: true }, error: undefined })
    h.unarchive.mockResolvedValue({ data: { success: true }, error: undefined })
    h.remove.mockResolvedValue({
        data: { success: false, error: "Erreur test" },
        error: undefined
    })
})

describe("<TicketActions /> contract sending", () => {
    it("lets the sender disable communication in the contract and email", async () => {
        const screen = await renderActions()
        await screen.getByRole("button", { name: "Envoyer le contrat" }).click()
        await expect
            .element(
                screen.getByRole("checkbox", {
                    name: "Inclure la clause de communication"
                })
            )
            .toBeChecked()
        await screen
            .getByRole("checkbox", {
                name: "Inclure la clause de communication"
            })
            .click()
        await screen
            .getByRole("button", { name: "Envoyer", exact: true })
            .click()
        await vi.waitFor(() =>
            expect(h.send).toHaveBeenCalledWith({
                ticketId: 1,
                equipmentIds: [1],
                includeCommunication: false
            })
        )
    })

    it("blocks sending while equipment quantities are being edited or saved", async () => {
        const screen = await renderActions()
        await screen
            .getByRole("button", { name: "Toggle quantity editing" })
            .click()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer le contrat" }))
            .toBeDisabled()
        await screen
            .getByRole("button", { name: "Toggle quantity editing" })
            .click()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer le contrat" }))
            .toBeEnabled()
    })
    it.each(["archive", "unarchive", "remove"] as const)(
        "keeps the %s dialog open until its footer action completes",
        async (action) => {
            const pending = Promise.withResolvers<{
                data: { success: false; error: string }
                error: undefined
            }>()
            h[action].mockReturnValueOnce(pending.promise)
            const screen = await renderActions(
                true,
                action === "unarchive",
                action === "remove"
            )
            const label =
                action === "archive"
                    ? "Archiver"
                    : action === "unarchive"
                      ? "Désarchiver"
                      : "Supprimer définitivement"
            await screen
                .getByRole("button", { name: label, exact: true })
                .click()
            const dialog = screen.getByRole("alertdialog")
            await dialog
                .getByRole("button", { name: label, exact: true })
                .click()
            await expect.element(dialog).toBeVisible()
            await expect
                .element(
                    dialog.getByRole("button", { name: new RegExp(label) })
                )
                .toBeDisabled()
            await expect
                .element(dialog.getByRole("button", { name: "Annuler" }))
                .toBeDisabled()
            await expect
                .element(dialog.getByLabelText("Chargement"))
                .toBeVisible()
            expect(
                document.querySelector(
                    '[data-slot="alert-dialog-trigger"] [aria-label="Chargement"]'
                )
            ).toBeNull()
            pending.resolve({
                data: { success: false, error: "Erreur test" },
                error: undefined
            })
            await expect.element(dialog).not.toBeInTheDocument()
            await expect
                .element(
                    screen.getByRole("button", { name: label, exact: true })
                )
                .toBeEnabled()
        }
    )

    it("closes the dialog and restores its buttons if the request rejects", async () => {
        h.send.mockRejectedValueOnce(new Error("Network error"))
        const screen = await renderActions()
        await screen.getByRole("button", { name: "Envoyer le contrat" }).click()
        await screen
            .getByRole("button", { name: "Envoyer", exact: true })
            .click()
        await expect
            .element(screen.getByRole("alertdialog"))
            .not.toBeInTheDocument()
        await expect
            .element(screen.getByRole("button", { name: "Envoyer le contrat" }))
            .toBeEnabled()
        expect(h.error).toHaveBeenCalledWith(
            "Une erreur est survenue. Veuillez réessayer."
        )
    })
    it.each([true, false])(
        "keeps the dialog open and footer disabled until completion (success=%s)",
        async (success) => {
            const pending = Promise.withResolvers<{
                data: { success: true } | { success: false; error: string }
                error: undefined
            }>()
            h.send.mockReturnValueOnce(pending.promise)
            const screen = await renderActions()
            await screen
                .getByRole("button", { name: "Envoyer le contrat" })
                .click()
            await screen
                .getByRole("button", { name: "Envoyer", exact: true })
                .click()
            const dialog = screen.getByRole("alertdialog")
            await expect.element(dialog).toBeVisible()
            await expect
                .element(dialog.getByRole("button", { name: /Envoyer/ }))
                .toBeDisabled()
            await expect
                .element(dialog.getByRole("button", { name: "Annuler" }))
                .toBeDisabled()
            await expect
                .element(dialog.getByLabelText("Chargement"))
                .toBeVisible()
            expect(
                document.querySelector(
                    '[data-slot="alert-dialog-trigger"] [aria-label="Chargement"]'
                )
            ).toBeNull()
            pending.resolve({
                data: success
                    ? { success: true }
                    : { success: false, error: "Erreur test" },
                error: undefined
            })
            await expect.element(dialog).not.toBeInTheDocument()
        }
    )
    it("submits only the ticket id and checked equipment ids, then shows the sent state", async () => {
        const screen = await renderActions()
        await screen.getByRole("button", { name: "Envoyer le contrat" }).click()
        await screen
            .getByRole("button", { name: "Envoyer", exact: true })
            .click()

        await vi.waitFor(() =>
            expect(h.send).toHaveBeenCalledWith({
                ticketId: 1,
                equipmentIds: [1],
                includeCommunication: true
            })
        )
        await expect
            .element(screen.getByText("Contrat envoyé", { exact: true }))
            .toBeVisible()
        expect(h.success).toHaveBeenCalledWith("Le contrat a été envoyé.")
    })

    it("prevents submission without selected equipment", async () => {
        const screen = await renderActions(false)
        await screen.getByRole("button", { name: "Envoyer le contrat" }).click()
        await expect
            .element(
                screen.getByRole("button", { name: "Envoyer", exact: true })
            )
            .toBeDisabled()
        expect(h.send).not.toHaveBeenCalled()
    })

    it("reports a server failure without marking the ticket as sent", async () => {
        h.send.mockResolvedValue({
            data: {
                success: false,
                error: "Echec de la génération du contrat PDF"
            },
            error: undefined
        })
        const screen = await renderActions()
        await screen.getByRole("button", { name: "Envoyer le contrat" }).click()
        await screen
            .getByRole("button", { name: "Envoyer", exact: true })
            .click()

        await vi.waitFor(() =>
            expect(h.error).toHaveBeenCalledWith(
                "Echec de la génération du contrat PDF"
            )
        )
        await expect
            .element(screen.getByRole("button", { name: "Envoyer le contrat" }))
            .toBeVisible()
        expect(h.success).not.toHaveBeenCalled()
    })
})
