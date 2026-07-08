import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Permission } from "@/generated/prisma/client"
import { renderWithClient as render } from "@/test/browser"

const h = vi.hoisted(() => ({ action: vi.fn() }))

vi.mock("astro:actions", () => ({
    actions: { users: { updateUserPermissions: h.action } }
}))

import { UserPermissionsForm } from "../userPermissionForm"

const perms: Permission[] = [
    {
        id: 1,
        name: "create:article",
        title: "Créer article",
        category: "Articles",
        description: null
    },
    {
        id: 2,
        name: "delete:article",
        title: "Supprimer article",
        category: "Articles",
        description: null
    }
]

beforeEach(() => {
    h.action.mockResolvedValue({ success: true })
})

describe("<UserPermissionsForm />", () => {
    it("renders a card per permission", async () => {
        const screen = await render(
            <UserPermissionsForm
                userId="user-1"
                userPermissions={[]}
                allPermissions={perms}
            />
        )
        await expect
            .element(screen.getByRole("button", { name: /Créer article/ }))
            .toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: /Supprimer article/ }))
            .toBeVisible()
    })

    it("toggles a permission and calls the action with the new ids", async () => {
        const screen = await render(
            <UserPermissionsForm
                userId="user-1"
                userPermissions={[]}
                allPermissions={perms}
            />
        )
        await screen.getByRole("button", { name: /Créer article/ }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        expect(h.action).toHaveBeenCalledWith({
            userId: "user-1",
            permissions: [1]
        })
    })

    it("selects every permission in a category at once", async () => {
        const screen = await render(
            <UserPermissionsForm
                userId="user-1"
                userPermissions={[]}
                allPermissions={perms}
            />
        )
        await screen.getByRole("button", { name: "Tout selectionner" }).click()

        await vi.waitFor(() => expect(h.action).toHaveBeenCalled())
        const { permissions: ids } = h.action.mock.calls[0][0]
        expect([...ids].sort()).toEqual([1, 2])
    })
})
