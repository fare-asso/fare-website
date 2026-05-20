import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import type { Partenaire } from "@/generated/prisma/client"

vi.mock("../editPartenaireButton", () => ({
    __esModule: true,
    default: function EditStub() {
        return <button type="button">edit-stub</button>
    }
}))
vi.mock("../deletePartenaireButton", () => ({
    __esModule: true,
    default: function DeleteStub() {
        return <button type="button">delete-stub</button>
    }
}))

import PartenaireCard from "../partenaireCard"

const partenaire: Partenaire = {
    id: 1,
    name: "ACME Corp",
    description: "Une grande entreprise.",
    logoPath: "uuid-acme.png"
}

describe("<PartenaireCard />", () => {
    it("renders the name and description", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={false}
                canDelete={false}
            />
        )
        await expect.element(screen.getByText("ACME Corp")).toBeVisible()
        await expect
            .element(screen.getByText("Une grande entreprise."))
            .toBeVisible()
    })

    it("renders the logo image with the partenaire alt text", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={false}
                canDelete={false}
            />
        )
        await expect
            .element(screen.getByRole("img", { name: "Logo de ACME Corp" }))
            .toBeVisible()
    })

    it("hides edit and delete buttons when permissions are denied", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={false}
                canDelete={false}
            />
        )
        expect(
            screen.getByRole("button", { name: "edit-stub" }).query()
        ).toBeNull()
        expect(
            screen.getByRole("button", { name: "delete-stub" }).query()
        ).toBeNull()
    })

    it("shows the edit button when canEdit is true", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={true}
                canDelete={false}
            />
        )
        await expect
            .element(screen.getByRole("button", { name: "edit-stub" }))
            .toBeVisible()
        expect(
            screen.getByRole("button", { name: "delete-stub" }).query()
        ).toBeNull()
    })

    it("shows the delete button when canDelete is true", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={false}
                canDelete={true}
            />
        )
        await expect
            .element(screen.getByRole("button", { name: "delete-stub" }))
            .toBeVisible()
        expect(
            screen.getByRole("button", { name: "edit-stub" }).query()
        ).toBeNull()
    })

    it("shows both buttons when canEdit and canDelete are true", async () => {
        const screen = await render(
            <PartenaireCard
                partenaire={partenaire}
                logoUrl="https://example.com/logo.png"
                canEdit={true}
                canDelete={true}
            />
        )
        await expect
            .element(screen.getByRole("button", { name: "edit-stub" }))
            .toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: "delete-stub" }))
            .toBeVisible()
    })
})
