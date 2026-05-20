import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { validPartenaireRecord } from "@/test/factories/partenaires"

const h = vi.hoisted(() => ({
    findMany: vi.fn(),
    getPublicUrl: vi.fn(),
    cardSpy: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ getPublicUrl: h.getPublicUrl })))

vi.mock("@/helpers/db", () => ({
    default: { partenaire: { findMany: h.findMany } }
}))
vi.mock("@/helpers/supabase/server", () => ({
    createClient: vi.fn(async () => ({ storage: { from } }))
}))
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
    h.findMany.mockResolvedValue([])
    h.getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.com/logo.png" }
    })
})

describe("<PartenaireList />", () => {
    it("renders the empty state when there are no partenaires", async () => {
        h.findMany.mockResolvedValue([])
        const ui = await PartenaireList({ canEdit: true, canDelete: true })
        const screen = await render(ui)
        await expect.element(screen.getByText("Aucun partenaire")).toBeVisible()
        await expect
            .element(screen.getByText("Ajoutez un partenaire pour commencer"))
            .toBeVisible()
    })

    it("renders the error state when prisma returns null", async () => {
        h.findMany.mockResolvedValue(null)
        const ui = await PartenaireList({ canEdit: false, canDelete: false })
        const screen = await render(ui)
        await expect
            .element(screen.getByText("Echec du chargement des partenaires"))
            .toBeVisible()
    })

    it("renders a card per partenaire with the public logo url", async () => {
        const a = validPartenaireRecord({ id: 1, name: "ACME" })
        const b = validPartenaireRecord({ id: 2, name: "Beta" })
        h.findMany.mockResolvedValue([a, b])
        h.getPublicUrl.mockImplementation((path: string) => ({
            data: { publicUrl: `https://cdn.test/${path}` }
        }))

        const ui = await PartenaireList({ canEdit: true, canDelete: false })
        const screen = await render(ui)

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
        h.findMany.mockResolvedValue([validPartenaireRecord()])
        const ui = await PartenaireList({ canEdit: false, canDelete: false })
        const screen = await render(ui)
        await expect
            .element(screen.getByText("1 partenaire", { exact: true }))
            .toBeVisible()
    })

    it("uses the plural 'partenaires' label when there are several", async () => {
        h.findMany.mockResolvedValue([
            validPartenaireRecord({ id: 1, name: "A" }),
            validPartenaireRecord({ id: 2, name: "B" }),
            validPartenaireRecord({ id: 3, name: "C" })
        ])
        const ui = await PartenaireList({ canEdit: false, canDelete: false })
        const screen = await render(ui)
        await expect.element(screen.getByText("3 partenaires")).toBeVisible()
    })

    it("requests partenaires ordered by name asc", async () => {
        h.findMany.mockResolvedValue([])
        await PartenaireList({ canEdit: false, canDelete: false })
        expect(h.findMany).toHaveBeenCalledWith({
            orderBy: { name: "asc" }
        })
    })
})
