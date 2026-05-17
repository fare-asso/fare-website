import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockUser } from "@/test/factories/user"
import { authModule, cacheModule, dbModule, sentryModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    getUser: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))
type Tx = {
    userPermission: {
        deleteMany: ReturnType<typeof vi.fn>
        createMany: ReturnType<typeof vi.fn>
    }
}
const transaction = vi.hoisted(() =>
    vi.fn(
        <T>(cb: (tx: Tx) => Promise<T>): Promise<T> =>
            cb({
                userPermission: {
                    deleteMany: h.deleteMany,
                    createMany: h.createMany
                }
            })
    )
)

vi.mock("@/helpers/db", () => {
    const client: Record<string, unknown> = {}
    // `$transaction` is a Prisma client method name; set it dynamically to
    // keep it off an object-literal identifier.
    Reflect.set(client, "$transaction", transaction)
    return dbModule(client)
})
vi.mock("@/helpers/supabase/auth", () => authModule(h.getUser))
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import updateUserPermissions from "../updateUserPermissions"

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:user-permissions"], "ADMIN"))
    h.deleteMany.mockResolvedValue({ count: 0 })
    h.createMany.mockResolvedValue({ count: 2 })
})

describe("updateUserPermissions", () => {
    it("throws when not authenticated", async () => {
        h.getUser.mockResolvedValue(null)
        await expect(updateUserPermissions("u2", [1])).rejects.toThrow(
            /Unauthorized/
        )
    })

    it("throws when not an ADMIN", async () => {
        h.getUser.mockResolvedValue(
            mockUser(["edit:user-permissions"], "MEMBER")
        )
        await expect(updateUserPermissions("u2", [1])).rejects.toThrow(
            /Admin only/
        )
    })

    it("throws when lacking the edit:user-permissions permission", async () => {
        h.getUser.mockResolvedValue(mockUser([], "ADMIN"))
        await expect(updateUserPermissions("u2", [1])).rejects.toThrow(
            /Insufficient permissions/
        )
    })

    it("captures and fails when the transaction throws", async () => {
        transaction.mockRejectedValueOnce(new Error("db down"))
        expect(await updateUserPermissions("u2", [1])).toEqual({
            success: false,
            error: "An error occurred while updating permissions."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("replaces the permissions and revalidates on the happy path", async () => {
        const res = await updateUserPermissions("u2", [1, 2])
        expect(res).toEqual({ success: true })
        expect(h.deleteMany).toHaveBeenCalledWith({
            where: { userId: "u2" }
        })
        expect(h.createMany).toHaveBeenCalledWith({
            data: [
                { userId: "u2", permissionId: 1 },
                { userId: "u2", permissionId: 2 }
            ],
            skipDuplicates: true
        })
        expect(h.revalidatePath).toHaveBeenCalledWith("/dashboard/users/u2")
    })
})
