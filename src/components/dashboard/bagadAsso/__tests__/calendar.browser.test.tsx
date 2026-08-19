import { describe, expect, it, vi } from "vitest"

import Calendar from "@/components/dashboard/bagadAsso/calendar"
import { ServerSearchContext } from "@/hooks/useSearchParam"
import { renderWithClient as render } from "@/test/browser"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

vi.mock("@tanstack/react-hotkeys", () => ({ useHotkey: vi.fn() }))

describe("<Calendar />", () => {
    it("shows an event on every day through its end date", async () => {
        window.history.replaceState(null, "", "?month=2026-09-15")
        const screen = await render(
            <ServerSearchContext.Provider value="month=2026-09-15">
                <Calendar
                    events={[
                        bagadAssoTicketRecord({
                            eventName: "Forum étudiant",
                            eventDate: new Date("2026-09-01T00:00:00Z"),
                            eventEndDate: new Date("2026-09-02T00:00:00Z")
                        })
                    ]}
                />
            </ServerSearchContext.Provider>
        )

        const segments = screen.getByTitle("Forum étudiant")
        await expect.element(segments.nth(1)).toBeVisible()
        await expect.element(segments.nth(0)).toHaveClass("rounded-r-none")
        await expect.element(segments.nth(0)).toHaveClass("overflow-visible")
        await expect.element(segments.nth(1)).toHaveClass("rounded-l-none")
    })
})
