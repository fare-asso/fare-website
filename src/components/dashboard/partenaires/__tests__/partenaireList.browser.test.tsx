import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { validPartenaireRecord } from "@/test/factories/partenaires"

const h = vi.hoisted(() => ({ cardSpy: vi.fn() }))

vi.mock("../partenaireCard", () => ({
    default: (props: Record<string, unknown>) => {
        h.cardSpy(props)
        return (
            <div data-testid="partenaire-card">
                {(props.partenaire as { name: string }).name}
            </div>
        )
    }
}))

import PartenaireList from "../partenaireList"

function withUrl(partenaire: ReturnType<typeof validPartenaireRecord>) {
    return {
        partenaire,
        logoUrl: `https://cdn.test/${partenaire.logoPath}`
    }
}

describe("<PartenaireList />", () => {
    it("renders the empty state when there are no partenaires", async () => {
        const screen = await render(
            <PartenaireList partenaires={[]} canEdit={true} canDelete={true} />
        )
        await expect.element(screen.getByText("Aucun partenaire")).toBeVisible()
        await expect
            .element(screen.getByText("Ajoutez un partenaire pour commencer"))
            .toBeVisible()
    })

    it("renders a card per partenaire with the public logo url", async () => {
        const a = withUrl(validPartenaireRecord({ id: 1, name: "ACME" }))
        const b = withUrl(validPartenaireRecord({ id: 2, name: "Beta" }))

        const screen = await render(
            <PartenaireList
                partenaires={[a, b]}
                canEdit={true}
                canDelete={false}
            />
        )

        await expect.element(screen.getByText("ACME")).toBeVisible()
        await expect.element(screen.getByText("Beta")).toBeVisible()

        expect(h.cardSpy).toHaveBeenCalledTimes(2)
        const first = h.cardSpy.mock.calls[0][0] as Record<string, unknown>
        expect(first).toMatchObject({
            partenaire: a.partenaire,
            canEdit: true,
            canDelete: false,
            logoUrl: a.logoUrl
        })
    })

    it("uses the singular 'partenaire' label when there is exactly one", async () => {
        const screen = await render(
            <PartenaireList
                partenaires={[withUrl(validPartenaireRecord())]}
                canEdit={false}
                canDelete={false}
            />
        )
        await expect
            .element(screen.getByText("1 partenaire", { exact: true }))
            .toBeVisible()
    })

    it("uses the plural 'partenaires' label when there are several", async () => {
        const screen = await render(
            <PartenaireList
                partenaires={[
                    withUrl(validPartenaireRecord({ id: 1, name: "A" })),
                    withUrl(validPartenaireRecord({ id: 2, name: "B" })),
                    withUrl(validPartenaireRecord({ id: 3, name: "C" }))
                ]}
                canEdit={false}
                canDelete={false}
            />
        )
        await expect.element(screen.getByText("3 partenaires")).toBeVisible()
    })
})
