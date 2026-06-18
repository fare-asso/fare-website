import { beforeEach, describe, expect, it, vi } from "vitest"

import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"
import { mockUser } from "@/test/factories/user"
import { dbModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findFirst: vi.fn(),
    findMany: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        user: { findFirst: h.findFirst },
        bagadAssoTicket: { findMany: h.findMany }
    })
)
vi.mock("@/lib/evlog", () => ({
    withEvlog: (handler: (...args: unknown[]) => unknown) => handler,
    useLogger: () => ({ set: vi.fn() }),
    createError: (opts: { status: number; message?: string }) =>
        Object.assign(new Error(opts.message ?? "error"), {
            status: opts.status
        })
}))

import { GET } from "../route"

function request(token?: string): Request {
    const url = token
        ? `http://localhost/api/bagad-asso/calendar.ics?token=${token}`
        : "http://localhost/api/bagad-asso/calendar.ics"
    return new Request(url)
}

beforeEach(() => {
    h.findFirst.mockResolvedValue(mockUser(["access:bagad-asso"]))
    h.findMany.mockResolvedValue([bagadAssoTicketRecord()])
})

describe("GET /api/bagad-asso/calendar.ics", () => {
    it("400 when the token is missing", async () => {
        await expect(GET(request())).rejects.toMatchObject({ status: 400 })
        expect(h.findFirst).not.toHaveBeenCalled()
    })

    it("500 when the token lookup fails", async () => {
        h.findFirst.mockRejectedValue(new Error("db down"))
        await expect(GET(request("abc"))).rejects.toMatchObject({ status: 500 })
    })

    it("401 when the token is invalid or revoked", async () => {
        h.findFirst.mockResolvedValue(null)
        await expect(GET(request("abc"))).rejects.toMatchObject({ status: 401 })
    })

    it("403 when the user lacks access:bagad-asso", async () => {
        h.findFirst.mockResolvedValue(mockUser([]))
        await expect(GET(request("abc"))).rejects.toMatchObject({ status: 403 })
    })

    it("500 when the ticket query fails", async () => {
        h.findMany.mockRejectedValue(new Error("db down"))
        await expect(GET(request("abc"))).rejects.toMatchObject({ status: 500 })
    })

    it("200 with a text/calendar body on success", async () => {
        const res = await GET(request("abc"))
        expect(res).toBeInstanceOf(Response)
        const response = res as Response
        expect(response.status).toBe(200)
        expect(response.headers.get("content-type")).toContain("text/calendar")
        expect(await response.text()).toContain("BEGIN:VCALENDAR")
    })
})
