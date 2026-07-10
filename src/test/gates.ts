import type { Mock } from "vitest"
import { expect, it } from "vitest"

import type { ActionResult } from "@/lib/action"
import { mockUser } from "@/test/factories/user"

/**
 * Registers the two gate cases shared by every server action: no session →
 * "Authentification requise", missing `permission` → /permission/ error.
 * `writes` are the IO spies that must remain untouched on denial.
 * Call inside the action's `describe` block.
 */
export function itIsGatedBy({
    action,
    permission,
    getUser,
    writes
}: {
    action: () => Promise<ActionResult>
    permission: string
    getUser: Mock
    writes: Mock[]
}): void {
    it("requires authentication", async () => {
        getUser.mockResolvedValue(null)
        expect(await action()).toEqual({
            success: false,
            error: "Authentification requise"
        })
        for (const write of writes) expect(write).not.toHaveBeenCalled()
    })

    it(`is gated on the ${permission} permission`, async () => {
        getUser.mockResolvedValue(mockUser(["unrelated:permission"]))
        const res = await action()
        if (res.success) throw new Error("expected failure")
        expect(res.error).toMatch(/permission/)
        for (const write of writes) expect(write).not.toHaveBeenCalled()
    })
}
