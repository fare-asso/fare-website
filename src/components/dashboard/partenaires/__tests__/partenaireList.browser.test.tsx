import { beforeEach, describe, expect, it, vi } from "vitest"
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

beforeEach(() => {
    h.cardSpy.mockClear()
})

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

    it("renders the error state when partenaires are null", async () => {
        const screen = await render(
            <PartenaireList
                partenaires={null}
                canEdit={false}
                canDelete={false}
            />
        )
        await expect
            .element(screen.getByText("Echec du chargement des partenaires"))
            .toBeVisible()
    })

    it("renders a card per partenaire with the public logo url", async () => {
        const a = validPartenaireRecord({ id: 1, name: "ACME" })
        const b = validPartenaireRecord({ id: 2, name: "Beta" })

        const screen = await render(
            <PartenaireList
                partenaires={[
                    {
                        partenaire: a,
                        logoUrl: `https://cdn.test/${a.logoPath}`
                    },
                    { partenaire: b, logoUrl: `https://cdn.test/${b.logoPath}` }
                ]}
                canEdit={true}
                canDelete={false}
            />
        )

        await expect.element(screen.getByText("ACME")).toBeVisible()
        await expect.element(screen.getByText("Beta")).toBeVisible()

        expect(h.cardSpy).toHaveBeenCalledTimes(2)
        const first = h.cardSpy.mock.calls[0][0] as Record<string, unknown>
        expect(first).toMatchObject({
            partenaire: a,
            canEdit: true,
            canDelete: false,
            logoUrl: `https://cdn.test/${a.logoPath}`
        })
    })

    it("uses the singular 'partenaire' label when there is exactly one", async () => {
        const p = validPartenaireRecord()
        const screen = await render(
            <PartenaireList
                partenaires={[
                    { partenaire: p, logoUrl: "https://cdn.test/logo.png" }
                ]}
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
                    validPartenaireRecord({ id: 1, name: "A" }),
                    validPartenaireRecord({ id: 2, name: "B" }),
                    validPartenaireRecord({ id: 3, name: "C" })
                ].map((partenaire) => ({
                    partenaire,
                    logoUrl: "https://cdn.test/logo.png"
                }))}
                canEdit={false}
                canDelete={false}
            />
        )
        await expect.element(screen.getByText("3 partenaires")).toBeVisible()
    })
})
