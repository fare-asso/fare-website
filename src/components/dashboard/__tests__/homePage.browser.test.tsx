import { describe, expect, it } from "vitest"

import { renderWithClient as render } from "@/test/browser"

import HomePage from "../homePage"

describe("<HomePage />", () => {
    it("shows accessible spaces and pending work", async () => {
        const screen = await render(
            <HomePage
                userName="Camille"
                items={[
                    {
                        href: "/dashboard/associations",
                        label: "Associations",
                        value: 12
                    }
                ]}
                pendingItems={[
                    {
                        href: "/dashboard/adhesions",
                        label: "Adhésions à traiter",
                        value: 3
                    }
                ]}
                upcomingEvents={[
                    {
                        id: 1,
                        name: "Assemblée générale",
                        startTime: new Date("2026-09-01T18:00:00"),
                        location: "Rennes"
                    }
                ]}
            />
        )

        await expect.element(screen.getByText("Bonjour Camille")).toBeVisible()
        await expect
            .element(screen.getByRole("heading", { name: "À traiter" }))
            .toBeVisible()
        await expect
            .element(screen.getByRole("link", { name: /Adhésions à traiter/ }))
            .toHaveAttribute("href", "/dashboard/adhesions")
        await expect
            .element(screen.getByText("Assemblée générale"))
            .toBeVisible()
        await expect
            .element(screen.getByRole("link", { name: /Associations/ }))
            .toHaveAttribute("href", "/dashboard/associations")
    })

    it("hides empty optional sections", async () => {
        const screen = await render(
            <HomePage
                userName={null}
                items={[]}
                pendingItems={[]}
                upcomingEvents={[]}
            />
        )

        await expect.element(screen.getByText("Vos espaces")).toBeVisible()
        expect(
            document.querySelector("[aria-labelledby='to-process-heading']")
        ).toBeNull()
        expect(
            document.querySelector("[aria-labelledby='events-heading']")
        ).toBeNull()
    })
})
