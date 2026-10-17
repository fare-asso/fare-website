import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import { renderWithClient as render } from "@/test/browser"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

const h = vi.hoisted(() => ({ update: vi.fn(), error: vi.fn() }))
vi.mock("astro:actions", () => ({
    actions: { bagadAsso: { updateTicketEquipmentQuantityAction: h.update } }
}))
vi.mock("sonner", () => ({ toast: { error: h.error } }))
// Keep this suite scoped to the quantity editor, not contract/archive dialogs.
vi.mock("../ticketActions", () => ({ default: (): ReactNode => null }))

import { TicketProvider, useTicketContext } from "../ticketContext"
import { TicketEquipment } from "../ticketEquipment"

function TicketSummary(): ReactNode {
    const { totalDeposit, isEquipmentBusy, ticket } = useTicketContext()
    return (
        <>
            <p>Total: {totalDeposit}€</p>
            <p>Busy: {String(isEquipmentBusy)}</p>
            <p>Stored: {JSON.stringify(ticket.equipments)}</p>
            <button type="button">Outside editor</button>
        </>
    )
}

async function renderEquipment(
    overrides: {
        canEditTicket?: boolean
        archived?: boolean
        validated?: boolean
    } = {}
): Promise<Awaited<ReturnType<typeof render>>> {
    return render(
        <TicketProvider
            ticket={bagadAssoTicketRecord({
                deleted: overrides.archived ? new Date() : null,
                validated: overrides.validated ? new Date() : null
            })}
            allEquipments={[
                {
                    id: 1,
                    name: "Barnum",
                    quantity: 2,
                    deposit: 50,
                    imagePath: undefined,
                    checked: true
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
            canEditTicket={overrides.canEditTicket ?? true}
            canDeleteTicket={false}
        >
            <TicketEquipment />
            <TicketSummary />
        </TicketProvider>
    )
}

beforeEach((): void => {
    h.update.mockReset()
    h.error.mockReset()
    h.update.mockResolvedValue({
        data: { success: true, value: { quantity: 3 } },
        error: undefined
    })
})

describe("<TicketEquipment /> quantity editing", (): void => {
    it("renders badges and selection, focuses/selects one editor and cancels with Escape", async (): Promise<void> => {
        const screen = await renderEquipment()
        await expect.element(screen.getByText("2×")).toBeVisible()
        await expect
            .element(screen.getByRole("checkbox", { name: "Barnum" }))
            .toBeChecked()
        await expect.element(screen.getByText("Busy: false")).toBeVisible()
        await screen
            .getByRole("button", { name: "Modifier la quantité pour Barnum" })
            .click()
        const input = screen.getByRole("spinbutton", {
            name: "Quantité pour Barnum"
        })
        await expect.element(input).toHaveFocus()
        await expect.element(input).toHaveValue(2)
        // Typing replaces the selected original quantity.
        await userEvent.keyboard("4")
        await expect.element(input).toHaveValue(4)
        await expect.element(screen.getByText("Busy: true")).toBeVisible()
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Table"
                })
            )
            .toBeDisabled()
        await userEvent.keyboard("{Escape}")
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
            )
            .toHaveFocus()
        await screen.getByRole("button", { name: "Outside editor" }).click()
        expect(h.update).not.toHaveBeenCalled()
        await expect.element(screen.getByText("2×")).toBeVisible()
        await expect.element(screen.getByText("Busy: false")).toBeVisible()
    })

    it.each(["Enter", "blur"])(
        "saves on %s, uses the returned quantity and updates deposit without changing selection",
        async (trigger): Promise<void> => {
            h.update.mockResolvedValueOnce({
                data: { success: true, value: { quantity: 4 } },
                error: undefined
            })
            const screen = await renderEquipment()
            await screen
                .getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
                .click()
            await screen.getByRole("spinbutton").fill("3")
            if (trigger === "Enter") await userEvent.keyboard("{Enter}")
            else
                await screen
                    .getByRole("button", { name: "Outside editor" })
                    .click()
            await expect.element(screen.getByText("4×")).toBeVisible()
            await expect
                .element(
                    screen.getByRole("button", {
                        name: "Modifier la quantité pour Barnum"
                    })
                )
                .toHaveFocus()
            expect(h.update).toHaveBeenCalledExactlyOnceWith({
                ticketId: 1,
                equipmentId: 1,
                quantity: 3
            })
            await expect.element(screen.getByText("Total: 225€")).toBeVisible()
            await expect
                .element(screen.getByText("200€", { exact: true }))
                .toBeVisible()
            await expect
                .element(screen.getByRole("checkbox", { name: "Barnum" }))
                .toBeChecked()
            await expect
                .element(screen.getByRole("checkbox", { name: "Table" }))
                .not.toBeChecked()
            await expect.element(screen.getByText("Busy: false")).toBeVisible()
        }
    )

    it.each(["", "0", "-1", "1.5", "9007199254740992"])(
        "rejects invalid input '%s' accessibly without submitting",
        async (quantity): Promise<void> => {
            const screen = await renderEquipment()
            await screen
                .getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
                .click()
            const input = screen.getByRole("spinbutton")
            await input.fill(quantity)
            await userEvent.keyboard("{Enter}")
            await expect
                .element(screen.getByRole("alert"))
                .toHaveTextContent(
                    "La quantité doit être un entier strictement positif."
                )
            await expect.element(input).toHaveAttribute("aria-invalid", "true")
            await expect
                .element(input)
                .toHaveAccessibleDescription(
                    "La quantité doit être un entier strictement positif."
                )
            await screen.getByRole("button", { name: "Outside editor" }).click()
            expect(h.update).not.toHaveBeenCalled()
            await expect.element(screen.getByText("Total: 125€")).toBeVisible()
            await expect.element(screen.getByText("Busy: true")).toBeVisible()
        }
    )

    it("blocks edits while pending, restores the original on failure and allows retry", async (): Promise<void> => {
        const pending = Promise.withResolvers<{
            data: { success: false; error: string }
            error: undefined
        }>()
        h.update.mockReturnValueOnce(pending.promise)
        const screen = await renderEquipment()
        await screen
            .getByRole("button", { name: "Modifier la quantité pour Barnum" })
            .click()
        await screen.getByRole("spinbutton").fill("3")
        await userEvent.keyboard("{Enter}")
        await expect.element(screen.getByRole("spinbutton")).toBeDisabled()
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Table"
                })
            )
            .toBeDisabled()
        await expect.element(screen.getByText("Busy: true")).toBeVisible()
        await expect.element(screen.getByText("Total: 125€")).toBeVisible()
        await userEvent.keyboard("{Escape}{Enter}")
        await expect.element(screen.getByRole("spinbutton")).toBeDisabled()
        await screen.getByRole("button", { name: "Outside editor" }).click()
        expect(h.update).toHaveBeenCalledTimes(1)
        pending.resolve({
            data: { success: false, error: "Quantité indisponible" },
            error: undefined
        })
        await expect.element(screen.getByText("2×")).toBeVisible()
        expect(h.error).toHaveBeenCalledWith("Quantité indisponible")
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
            )
            .toHaveFocus()
        await expect.element(screen.getByText("Busy: false")).toBeVisible()
        await screen
            .getByRole("button", { name: "Modifier la quantité pour Barnum" })
            .click()
        await expect.element(screen.getByRole("spinbutton")).toHaveValue(2)
        await screen.getByRole("spinbutton").fill("3")
        await userEvent.keyboard("{Enter}")
        await expect.element(screen.getByText("3×")).toBeVisible()
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
            )
            .toHaveFocus()
        expect(h.update).toHaveBeenCalledTimes(2)
    })

    it.each(["transport", "rejection"])(
        "handles %s errors without committing",
        async (failure): Promise<void> => {
            if (failure === "transport")
                h.update.mockResolvedValueOnce({
                    data: undefined,
                    error: { message: "Network" }
                })
            else h.update.mockRejectedValueOnce(new Error("Network"))
            const screen = await renderEquipment()
            await screen
                .getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
                .click()
            await screen.getByRole("spinbutton").fill("3")
            await userEvent.keyboard("{Enter}")
            await expect.element(screen.getByText("Busy: false")).toBeVisible()
            await expect.element(screen.getByText("2×")).toBeVisible()
            await expect
                .element(
                    screen.getByRole("button", {
                        name: "Modifier la quantité pour Barnum"
                    })
                )
                .toHaveFocus()
            expect(h.error).toHaveBeenCalledWith(
                "Une erreur est survenue. Veuillez réessayer."
            )
            await expect.element(screen.getByText("Total: 125€")).toBeVisible()
        }
    )

    it("closes an unchanged quantity without sending a request", async (): Promise<void> => {
        const screen = await renderEquipment()
        await screen
            .getByRole("button", { name: "Modifier la quantité pour Barnum" })
            .click()
        await userEvent.keyboard("{Enter}")
        await expect.element(screen.getByText("Busy: false")).toBeVisible()
        expect(h.update).not.toHaveBeenCalled()
        await expect
            .element(
                screen.getByRole("button", {
                    name: "Modifier la quantité pour Barnum"
                })
            )
            .toHaveFocus()
    })

    it("returns focus to the edited row rather than another quantity button", async (): Promise<void> => {
        const screen = await renderEquipment()
        const button = screen.getByRole("button", {
            name: "Modifier la quantité pour Table"
        })
        await button.click()
        await screen.getByRole("spinbutton").fill("5")
        await userEvent.keyboard("{Escape}")
        await expect.element(button).toHaveFocus()
        expect(h.update).not.toHaveBeenCalled()
    })

    it.each([
        { canEditTicket: false },
        { archived: true },
        { validated: true }
    ])(
        "keeps quantities read-only for %j",
        async (overrides): Promise<void> => {
            const screen = await renderEquipment(overrides)
            await expect.element(screen.getByText("2×")).toBeVisible()
            await expect
                .element(
                    screen.getByRole("button", { name: /Modifier la quantité/ })
                )
                .not.toBeInTheDocument()
            await screen.getByRole("checkbox", { name: "Table" }).click()
            await expect
                .element(screen.getByRole("checkbox", { name: "Table" }))
                .toBeChecked()
            expect(h.update).not.toHaveBeenCalled()
        }
    )
})
