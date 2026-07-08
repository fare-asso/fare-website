import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const h = vi.hoisted(() => ({
    updateCategoryOrder: vi.fn(),
    noop: vi.fn()
}))

vi.mock("astro:actions", () => ({
    actions: {
        links: {
            updateLinkCategoryOrderAction: h.updateCategoryOrder,
            updateLinkOrderAction: h.noop,
            addLinkAction: h.noop,
            editLinkAction: h.noop,
            deleteLinkAction: h.noop,
            editLinkCategoryAction: h.noop,
            deleteLinkCategoryAction: h.noop
        }
    }
}))

import LinksManager from "../linksManager"

function makeCategories() {
    return [
        { id: 1, name: "Réseaux sociaux", order: 0, liens: [] },
        { id: 2, name: "Documents", order: 1, liens: [] }
    ]
}

async function renderManager(): Promise<Awaited<ReturnType<typeof render>>> {
    return await render(
        <LinksManager
            categories={makeCategories()}
            files={{}}
            canCreate={false}
            canEdit={true}
            canDelete={false}
        />
    )
}

function headings(screen: Awaited<ReturnType<typeof render>>): string[] {
    return Array.from(screen.container.querySelectorAll("h2")).map(
        (el) => el.textContent ?? ""
    )
}

beforeEach(() => {
    h.updateCategoryOrder.mockReset()
    h.updateCategoryOrder.mockResolvedValue({
        data: { success: true },
        error: undefined
    })
})

describe("<LinksManager />", () => {
    it("renders categories in order with boundary buttons disabled", async () => {
        const screen = await renderManager()
        expect(headings(screen)).toEqual(["Réseaux sociaux", "Documents"])
        await expect
            .element(screen.getByRole("button", { name: "Monter" }).first())
            .toBeDisabled()
        await expect
            .element(screen.getByRole("button", { name: "Descendre" }).last())
            .toBeDisabled()
    })

    it("reorders optimistically before the action resolves", async () => {
        let resolveAction!: (v: unknown) => void
        h.updateCategoryOrder.mockReturnValue(
            new Promise((r) => {
                resolveAction = r
            })
        )
        const screen = await renderManager()

        await screen.getByRole("button", { name: "Descendre" }).first().click()

        await vi.waitFor(() =>
            expect(headings(screen)).toEqual(["Documents", "Réseaux sociaux"])
        )
        expect(h.updateCategoryOrder).toHaveBeenCalledWith([
            { id: 2, order: 0 },
            { id: 1, order: 1 }
        ])
        resolveAction({ data: { success: true }, error: undefined })
    })

    it("reverts to the server order when the action fails", async () => {
        h.updateCategoryOrder.mockResolvedValue({
            data: {
                success: false,
                error: "Échec de la mise à jour de l'ordre."
            },
            error: undefined
        })
        const screen = await renderManager()

        await screen.getByRole("button", { name: "Monter" }).last().click()

        await vi.waitFor(() => expect(h.updateCategoryOrder).toHaveBeenCalled())
        await vi.waitFor(() =>
            expect(headings(screen)).toEqual(["Réseaux sociaux", "Documents"])
        )
    })
})
