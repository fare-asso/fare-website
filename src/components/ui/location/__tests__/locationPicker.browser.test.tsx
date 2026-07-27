import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import LocationPicker from "../locationPicker"

const SUGGESTIONS = [
    { label: "1 Rue de Paris, 35000 Rennes", lat: "48.11", lon: "-1.67" },
    { label: "Place du Parlement, 35000 Rennes", lat: "48.10", lon: "-1.68" }
]

const expectedValue = JSON.stringify({
    displayName: SUGGESTIONS[0].label,
    coordinates: { lat: SUGGESTIONS[0].lat, lon: SUGGESTIONS[0].lon }
})

function mockSearch(suggestions = SUGGESTIONS): ReturnType<typeof vi.spyOn> {
    return vi.spyOn(window, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ suggestions }), {
            status: 200,
            headers: { "content-type": "application/json" }
        })
    )
}

function combobox(container: HTMLElement): HTMLElement {
    return container.querySelector('[role="combobox"]') as HTMLElement
}

// React listens for key events via delegation on the root, so a bubbling
// native KeyboardEvent is enough to drive the combobox's keyboard handler.
function pressKey(el: HTMLElement, key: string): void {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
}

beforeEach(() => {
    vi.restoreAllMocks()
})

describe("<LocationPicker />", () => {
    it("does not query the API below 3 characters", async () => {
        const fetchSpy = mockSearch()
        const screen = await render(<LocationPicker name="location" />)

        expect(combobox(screen.container).getAttribute("aria-expanded")).toBe(
            "false"
        )

        await screen.getByRole("combobox").fill("re")
        expect(fetchSpy).not.toHaveBeenCalled()
    })

    it("exposes the ARIA combobox contract", async () => {
        const screen = await render(<LocationPicker name="location" />)
        const input = combobox(screen.container)
        expect(input.getAttribute("aria-autocomplete")).toBe("list")
        expect(input.getAttribute("aria-haspopup")).toBe("listbox")
        // aria-controls must not dangle while the listbox is closed
        expect(input.getAttribute("aria-controls")).toBeNull()

        mockSearch()
        await screen.getByRole("combobox").fill("rennes")
        await vi.waitFor(() => {
            expect(input.getAttribute("aria-expanded")).toBe("true")
            const controls = input.getAttribute("aria-controls")
            expect(controls).toBeTruthy()
            expect(document.getElementById(controls as string)).not.toBeNull()
        })
    })

    it("fetches, selects on click, and emits the geolocated JSON value", async () => {
        mockSearch()
        const onChange = vi.fn()
        const screen = await render(
            <LocationPicker name="location" onChange={onChange} />
        )

        await screen.getByRole("combobox").fill("rennes")

        const option = screen.getByRole("option", {
            name: SUGGESTIONS[0].label
        })
        await expect.element(option).toBeVisible()

        // a11y: the combobox is expanded and wired to the listbox popup
        const input = combobox(screen.container)
        expect(input.getAttribute("aria-expanded")).toBe("true")
        expect(input.getAttribute("aria-controls")).toBe(
            screen.getByRole("listbox").element().id
        )

        await option.click()

        await vi.waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith(expectedValue)
        )
        // hidden form field carries the stored JSON
        const hidden = screen.container.querySelector<HTMLInputElement>(
            'input[name="location"]'
        )
        expect(hidden?.value).toBe(expectedValue)
        await expect.element(screen.getByText("Lieu géolocalisé")).toBeVisible()
    })

    it("navigates and selects suggestions with the keyboard", async () => {
        mockSearch()
        const onChange = vi.fn()
        const screen = await render(<LocationPicker onChange={onChange} />)

        await screen.getByRole("combobox").fill("rennes")
        await expect
            .element(screen.getByRole("option", { name: SUGGESTIONS[0].label }))
            .toBeVisible()

        const input = combobox(screen.container)
        pressKey(input, "ArrowDown")

        // a11y: ArrowDown highlights an option, exposed via
        // aria-activedescendant on the input + aria-selected on the option.
        await vi.waitFor(() => {
            const activeId = input.getAttribute("aria-activedescendant")
            expect(activeId).toBeTruthy()
            expect(
                document
                    .getElementById(activeId as string)
                    ?.getAttribute("aria-selected")
            ).toBe("true")
        })

        // Enter commits a geolocated suggestion.
        const validValues = SUGGESTIONS.map((s) =>
            JSON.stringify({
                displayName: s.label,
                coordinates: { lat: s.lat, lon: s.lon }
            })
        )
        pressKey(input, "Enter")
        await vi.waitFor(() =>
            expect(validValues).toContain(onChange.mock.lastCall?.[0])
        )
    })
})
