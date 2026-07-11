import { beforeEach, describe, expect, it, vi } from "vitest"

import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    qDelete: vi.fn(),
    bagadUpdate: vi.fn(),
    appFind: vi.fn(),
    appUpdate: vi.fn(),
    adhFind: vi.fn(),
    adhDelete: vi.fn(),
    assocUpdate: vi.fn(),
    remove: vi.fn(),
    capture: vi.fn()
}))
const from = vi.hoisted(() => vi.fn(() => ({ remove: h.remove })))

vi.mock("@/helpers/db", () =>
    dbModule({
        bTPTutorQuestion: { deleteMany: h.qDelete },
        bagadAssoTicket: { updateMany: h.bagadUpdate },
        bTPTutorApplication: { findMany: h.appFind, updateMany: h.appUpdate },
        adhesion: { findMany: h.adhFind, deleteMany: h.adhDelete },
        association: { updateMany: h.assocUpdate }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ storage: { from } })
)
vi.mock("@/lib/sentry", () => sentryModule(h.capture))

import { runPurge } from "../purge"

beforeEach(() => {
    vi.clearAllMocks()
    h.qDelete.mockResolvedValue({ count: 2 })
    h.bagadUpdate.mockResolvedValue({ count: 1 })
    h.appFind.mockResolvedValue([
        { id: 1, cvPath: "a/cv.pdf", mlPath: "a/ml.pdf" }
    ])
    h.appUpdate.mockResolvedValue({ count: 1 })
    h.adhFind.mockResolvedValue([
        {
            id: 5,
            logoPath: "f/logo.png",
            statutsPath: "f/statuts.pdf",
            recepissePath: "",
            extraitPVPath: "f/pv.pdf",
            lettreEngagementPath: null,
            reglementInterieurPath: null,
            bilanFinancierPath: null,
            photosPaths: ["f/p1.jpg", "f/p2.jpg"]
        }
    ])
    h.adhDelete.mockResolvedValue({ count: 1 })
    h.assocUpdate.mockResolvedValue({ count: 1 })
    h.remove.mockResolvedValue({ data: [], error: null })
})

describe("runPurge", () => {
    it("returns per-table counts on the happy path", async () => {
        expect(await runPurge()).toEqual({
            btpQuestions: 2,
            btpApplications: 1,
            bagadTickets: 1,
            adhesions: 1
        })
        expect(h.capture).not.toHaveBeenCalled()
    })

    it("anonymises Bagad'Asso tickets, keeping the stats fields", async () => {
        await runPurge()
        expect(h.bagadUpdate).toHaveBeenCalledTimes(1)
        const arg = h.bagadUpdate.mock.calls[0][0]
        expect(arg.where.firstName).toEqual({ not: "<redacted>" })
        expect(arg.data).toEqual({
            firstName: "<redacted>",
            lastName: "<redacted>",
            position: "<redacted>",
            phoneNumber: null,
            associationEmail: "<redacted>",
            representativeEmail: "<redacted>",
            eventAddr: "<redacted>"
        })
        // stats kept: no association / equipment / dates in the cleared data
        expect(arg.data).not.toHaveProperty("equipments")
        expect(arg.data).not.toHaveProperty("association")
    })

    it("removes BTP files then anonymises the rows (no full delete)", async () => {
        await runPurge()
        expect(from).toHaveBeenCalledWith("btp-tutor-application")
        expect(h.remove).toHaveBeenCalledWith(["a/cv.pdf", "a/ml.pdf"])
        expect(h.appUpdate).toHaveBeenCalledWith({
            where: { id: { in: [1] } },
            data: {
                firstName: "<redacted>",
                lastName: "<redacted>",
                email: "<redacted>",
                cvPath: "<redacted>",
                mlPath: "<redacted>"
            }
        })
    })

    it("removes only non-empty adhesion files, unlinks the association, then deletes", async () => {
        await runPurge()
        expect(from).toHaveBeenCalledWith("adhesion")
        expect(h.remove).toHaveBeenCalledWith([
            "f/logo.png",
            "f/statuts.pdf",
            "f/pv.pdf",
            "f/p1.jpg",
            "f/p2.jpg"
        ])
        expect(h.assocUpdate).toHaveBeenCalledWith({
            where: { adhesionId: { in: [5] } },
            data: { adhesionId: null }
        })
        expect(h.assocUpdate.mock.invocationCallOrder[0]).toBeLessThan(
            h.adhDelete.mock.invocationCallOrder[0]
        )
    })

    it("skips storage and updates when nothing is expired", async () => {
        h.appFind.mockResolvedValue([])
        h.adhFind.mockResolvedValue([])
        expect(await runPurge()).toEqual({
            btpQuestions: 2,
            btpApplications: 0,
            bagadTickets: 1,
            adhesions: 0
        })
        expect(h.remove).not.toHaveBeenCalled()
        expect(h.appUpdate).not.toHaveBeenCalled()
        expect(h.adhDelete).not.toHaveBeenCalled()
        expect(h.assocUpdate).not.toHaveBeenCalled()
    })

    it("isolates a table failure and still purges the others", async () => {
        h.adhFind.mockRejectedValue(new Error("db down"))
        expect(await runPurge()).toEqual({
            btpQuestions: 2,
            btpApplications: 1,
            bagadTickets: 1,
            adhesions: 0
        })
        expect(h.capture).toHaveBeenCalledTimes(1)
        expect(h.adhDelete).not.toHaveBeenCalled()
    })

    it("captures a storage error but still anonymises the rows", async () => {
        h.remove.mockResolvedValue({ data: null, error: new Error("storage") })
        expect((await runPurge()).btpApplications).toBe(1)
        expect(h.capture).toHaveBeenCalled()
        expect(h.appUpdate).toHaveBeenCalled()
    })
})
