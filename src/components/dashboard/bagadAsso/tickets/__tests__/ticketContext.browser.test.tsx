import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { renderWithClient as render } from "@/test/browser"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

import { TicketProvider, useTicketContext } from "../ticketContext"

function TicketConsumer(): ReactNode {
    const { allEquipments, ticket, dispatch } = useTicketContext()

    return (
        <>
            <p>Checked: {String(allEquipments[0].checked)}</p>
            <p>Archived: {String(ticket.deleted !== null)}</p>
            <button
                type="button"
                onClick={() =>
                    dispatch({
                        type: "setEquipmentChecked",
                        id: 1,
                        checked: true
                    })
                }
            >
                Check equipment
            </button>
            <button
                type="button"
                onClick={() =>
                    dispatch({ type: "setArchived", deleted: new Date() })
                }
            >
                Archive ticket
            </button>
        </>
    )
}

describe("<TicketProvider />", () => {
    it("rerenders consumers when ticket details are updated", async () => {
        const screen = await render(
            <TicketProvider
                ticket={bagadAssoTicketRecord()}
                allEquipments={[
                    {
                        id: 1,
                        name: "Barnum",
                        quantity: 1,
                        deposit: 50,
                        imagePath: undefined
                    }
                ]}
                totalDeposit={50}
                canEditTicket={false}
                canDeleteTicket={false}
            >
                <TicketConsumer />
            </TicketProvider>
        )

        await expect
            .element(screen.getByText("Checked: undefined"))
            .toBeVisible()
        await screen.getByRole("button", { name: "Check equipment" }).click()
        await expect.element(screen.getByText("Checked: true")).toBeVisible()
        await screen.getByRole("button", { name: "Archive ticket" }).click()
        await expect.element(screen.getByText("Archived: true")).toBeVisible()
    })
})
