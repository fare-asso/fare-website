import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithClient as render } from "@/test/browser"

const h = vi.hoisted(() => ({
    generate: vi.fn(),
    revoke: vi.fn()
}))

vi.mock("astro:actions", () => ({
    actions: {
        bagadAsso: {
            generateBagadCalendarTokenAction: h.generate,
            revokeBagadCalendarTokenAction: h.revoke
        }
    },
    isInputError: () => false
}))
vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}))

import CalendarFeed from "../calendarFeed"

async function open(
    token: string | null
): Promise<Awaited<ReturnType<typeof render>>> {
    const screen = await render(<CalendarFeed token={token} />)
    await screen.getByRole("button", { name: "Calendrier" }).click()
    return screen
}

beforeEach(() => {
    h.generate.mockResolvedValue({
        data: { success: true, value: "new-token-123" },
        error: undefined
    })
    h.revoke.mockResolvedValue({ data: { success: true }, error: undefined })
})

describe("<CalendarFeed />", () => {
    it("shows only the generate button when there is no token", async () => {
        const screen = await open(null)
        await expect
            .element(screen.getByRole("button", { name: /Générer le lien/ }))
            .toBeVisible()
    })

    it("generates a token and reveals the feed URL", async () => {
        const screen = await open(null)
        await screen.getByRole("button", { name: /Générer le lien/ }).click()
        await vi.waitFor(() => expect(h.generate).toHaveBeenCalled())
        const input = screen.getByRole("textbox")
        await expect.element(input).toBeVisible()
        expect((input.element() as HTMLInputElement).value).toMatch(
            /\/api\/bagad-asso\/calendar\.ics\?token=new-token-123$/
        )
    })

    it("renders the feed URL for an existing token", async () => {
        const screen = await open("abc")
        const input = screen.getByRole("textbox")
        await expect.element(input).toBeVisible()
        expect((input.element() as HTMLInputElement).value).toMatch(
            /\/api\/bagad-asso\/calendar\.ics\?token=abc$/
        )
    })

    it("revokes the token", async () => {
        const screen = await open("abc")
        await screen.getByRole("button", { name: /Révoquer/ }).click()
        await vi.waitFor(() => expect(h.revoke).toHaveBeenCalled())
    })
})
