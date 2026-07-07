import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { validMemberRecord } from "@/test/factories/members"

const h = vi.hoisted(() => ({
    deleteAction: vi.fn(),
    orderAction: vi.fn()
}))

vi.mock("@/actions/members/deleteMemberAction", () => ({
    deleteMemberAction: h.deleteAction
}))
vi.mock("@/actions/members/updateMemberOrderAction", () => ({
    updateMemberOrderAction: h.orderAction
}))
// Stub the edit button to avoid pulling its server action (and prisma) into
// the browser bundle, and the image to keep rendering deterministic.
vi.mock("@/components/dashboard/members/editMemberButton", () => ({
    default: () => null
}))
vi.mock("next/image", () => ({ default: () => null }))

vi.mock("@tanstack/react-router", () => ({
    useRouter: () => ({ invalidate: vi.fn() })
}))

import SortableMemberList from "../sortableMemberList"

function members() {
    return [
        {
            member: validMemberRecord({
                id: 1,
                firstName: "Lea",
                lastName: "Martin"
            }),
            pictureUrl: "/lea.png"
        },
        {
            member: validMemberRecord({
                id: 2,
                firstName: "Lou",
                lastName: "Durand"
            }),
            pictureUrl: "/lou.png"
        }
    ]
}

async function renderList(): Promise<Awaited<ReturnType<typeof render>>> {
    return await render(
        <SortableMemberList
            initialMembers={members()}
            canEdit={false}
            canDelete={true}
        />
    )
}

function names(screen: Awaited<ReturnType<typeof render>>): string[] {
    return Array.from(screen.container.querySelectorAll("p.font-medium")).map(
        (el) => el.textContent ?? ""
    )
}

beforeEach(() => {
    h.deleteAction.mockReset()
    h.deleteAction.mockResolvedValue({ success: true })
})

describe("<SortableMemberList />", () => {
    it("renders every member", async () => {
        const screen = await renderList()
        expect(names(screen)).toEqual(["Lea Martin", "Lou Durand"])
    })

    it("removes a member optimistically before the action resolves", async () => {
        let resolveAction!: (v: unknown) => void
        h.deleteAction.mockReturnValue(
            new Promise((r) => {
                resolveAction = r
            })
        )
        const screen = await renderList()

        await screen.getByRole("button").first().click()

        await vi.waitFor(() => expect(names(screen)).toEqual(["Lou Durand"]))
        expect(h.deleteAction).toHaveBeenCalledWith({ data: { id: 1 } })
        resolveAction({ success: true })
    })

    it("restores the member when the delete fails", async () => {
        h.deleteAction.mockResolvedValue({
            success: false,
            error: "Echec de la suppression du membre"
        })
        const screen = await renderList()

        await screen.getByRole("button").first().click()

        await vi.waitFor(() => expect(h.deleteAction).toHaveBeenCalled())
        await vi.waitFor(() =>
            expect(names(screen)).toEqual(["Lea Martin", "Lou Durand"])
        )
    })
})
