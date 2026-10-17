import { describe, expect, it, vi } from "vitest"

import {
    backfillTicketEquipment,
    parseLegacyTicketEquipment,
    type BackfillDatabase,
    type EquipmentTransfer
} from "../backfillTicketEquipment"

type Ticket = {
    id: number
    legacyEquipments: unknown
    equipmentRevision: number
    equipmentMigratedAt: Date | null
    validated: Date | null
    equipments: EquipmentTransfer[]
}

function ticket(overrides: Partial<Ticket> = {}): Ticket {
    return {
        id: 1,
        legacyEquipments: [{ id: 7, quantity: 3 }],
        equipmentRevision: 0,
        equipmentMigratedAt: null,
        validated: null,
        equipments: [],
        ...overrides
    }
}

function row(overrides: Partial<EquipmentTransfer> = {}): EquipmentTransfer {
    return {
        equipmentId: 7,
        requestedQuantity: 3,
        allocatedQuantity: 3,
        includedInContract: false,
        ...overrides
    }
}

function harness(tickets: Ticket[] = [ticket()]): {
    db: BackfillDatabase
    state: { tickets: Ticket[] }
    findTickets: ReturnType<typeof vi.fn>
    findCatalogue: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
    updateMany: ReturnType<typeof vi.fn>
    findRows: ReturnType<typeof vi.fn>
    createMany: ReturnType<typeof vi.fn>
    createEquipment: ReturnType<typeof vi.fn>
    advanceSequence: ReturnType<typeof vi.fn>
} {
    const state = { tickets: structuredClone(tickets) }
    let working = structuredClone(tickets)
    const findTickets = vi.fn(async () => structuredClone(state.tickets))
    const findCatalogue = vi.fn(async () => [{ id: 7 }, { id: 8 }])
    const updateMany = vi.fn(
        async (input: {
            where: { id: number }
            data: {
                equipmentRevision?: { increment: number }
                equipmentMigratedAt?: Date
            }
        }) => {
            const found = working.find((item) => item.id === input.where.id)!
            if (input.data.equipmentRevision) {
                found.equipmentRevision +=
                    input.data.equipmentRevision.increment
            }
            if (input.data.equipmentMigratedAt) {
                found.equipmentMigratedAt = input.data.equipmentMigratedAt
            }
            return { count: 1 }
        }
    )
    const findRows = vi.fn(async (input: { where: { ticketId: number } }) =>
        structuredClone(
            working.find((item) => item.id === input.where.ticketId)!.equipments
        )
    )
    const createMany = vi.fn(
        async (input: {
            data: (EquipmentTransfer & { ticketId: number })[]
        }) => {
            for (const { ticketId, ...equipment } of input.data) {
                working
                    .find((item) => item.id === ticketId)!
                    .equipments.push(equipment)
            }
            return { count: input.data.length }
        }
    )
    const createEquipment = vi.fn(
        async (input: { data: { id: number }[] }) => ({
            count: input.data.length
        })
    )
    const advanceSequence = vi.fn(async () => [])
    const tx = {
        bagadAssoEquipment: { createMany: createEquipment },
        $queryRaw: advanceSequence,
        bagadAssoTicket: { updateMany },
        bagadAssoTicketEquipment: { findMany: findRows, createMany }
    }
    const transaction = vi.fn(
        async (fn: (client: typeof tx) => Promise<void>) => {
            working = structuredClone(state.tickets)
            await fn(tx)
            state.tickets = working
        }
    )
    const db = {
        bagadAssoTicket: { findMany: findTickets },
        bagadAssoEquipment: { findMany: findCatalogue },
        $transaction: transaction
    } as unknown as BackfillDatabase
    return {
        db,
        state,
        findTickets,
        findCatalogue,
        transaction,
        updateMany,
        findRows,
        createMany,
        createEquipment,
        advanceSequence
    }
}

describe("parseLegacyTicketEquipment", () => {
    it.each([
        [{ id: 1, quantity: 2147483647 }],
        '[{"id":2147483647,"quantity":1}]',
        [],
        "[]"
    ])("accepts strict native/string arrays: %j", (archive) => {
        expect(parseLegacyTicketEquipment(archive).success).toBe(true)
    })

    it.each([
        null,
        undefined,
        {},
        1,
        true,
        "null",
        "not json",
        '"[]"',
        [null],
        [[]],
        [{ id: 1 }],
        [{ quantity: 1 }],
        [{ id: 1, quantity: 2, name: "must not drop" }],
        [{ id: "1", quantity: 2 }],
        [{ id: 1, quantity: "2" }],
        [{ id: 0, quantity: 1 }],
        [{ id: -1, quantity: 1 }],
        [{ id: 1.5, quantity: 1 }],
        [{ id: 2147483648, quantity: 1 }],
        [{ id: 1, quantity: 0 }],
        [{ id: 1, quantity: -1 }],
        [{ id: 1, quantity: 1.5 }],
        [{ id: 1, quantity: 2147483648 }],
        [{ id: 1, quantity: Number.NaN }],
        [{ id: 1, quantity: Number.POSITIVE_INFINITY }],
        [
            { id: 1, quantity: 1 },
            { id: 1, quantity: 2 }
        ]
    ])("rejects without coercion or silent data loss: %j", (archive) => {
        expect(parseLegacyTicketEquipment(archive).success).toBe(false)
    })
})

describe("backfillTicketEquipment", () => {
    it("previews replacement equipment without creating it in dry-run mode", async () => {
        const h = harness([
            ticket({ legacyEquipments: [{ id: 99, quantity: 2 }] })
        ])
        expect(
            await backfillTicketEquipment(h.db, { fillMissingEquipment: true })
        ).toMatchObject({
            success: true,
            replacementEquipmentIds: [99],
            ready: [1],
            applied: []
        })
        expect(h.transaction).not.toHaveBeenCalled()
        expect(h.createEquipment).not.toHaveBeenCalled()
    })

    it("creates ordinary replacement records without overwriting catalogue data", async () => {
        const h = harness([
            ticket({ legacyEquipments: [{ id: 99, quantity: 2 }] })
        ])
        expect(
            await backfillTicketEquipment(h.db, {
                apply: true,
                fillMissingEquipment: true
            })
        ).toMatchObject({
            success: true,
            applied: [1],
            replacementEquipmentIds: [99]
        })
        expect(h.createEquipment).toHaveBeenCalledWith({
            data: [{ id: 99, name: "Matériel #99", quantity: 0, deposit: 0 }],
            skipDuplicates: true
        })
        expect(h.advanceSequence).toHaveBeenCalledOnce()
        expect(h.state.tickets[0].equipments).toEqual([
            row({ equipmentId: 99, requestedQuantity: 2, allocatedQuantity: 2 })
        ])
    })

    it("still blocks malformed data before creating replacements", async () => {
        const h = harness([
            ticket({ legacyEquipments: [{ id: 99, quantity: 2 }] }),
            ticket({ id: 2, legacyEquipments: "broken" })
        ])
        expect(
            await backfillTicketEquipment(h.db, {
                apply: true,
                fillMissingEquipment: true
            })
        ).toMatchObject({ success: false, applied: [] })
        expect(h.createEquipment).not.toHaveBeenCalled()
    })

    it("rolls back the ticket when replacement creation fails", async () => {
        const original = ticket({ legacyEquipments: [{ id: 99, quantity: 2 }] })
        const h = harness([original])
        h.createEquipment.mockRejectedValueOnce(new Error("db down"))
        expect(
            await backfillTicketEquipment(h.db, {
                apply: true,
                fillMissingEquipment: true
            })
        ).toMatchObject({ success: false, applied: [] })
        expect(h.state.tickets).toEqual([original])
    })
    it("defaults to dry-run, reads all tickets including deleted, and never starts a transaction", async () => {
        const h = harness()
        const before = structuredClone(h.state.tickets)
        expect(await backfillTicketEquipment(h.db)).toEqual({
            success: true,
            mode: "dry-run",
            scanned: 1,
            skipped: [],
            ready: [1],
            applied: [],
            blockers: []
        })
        expect(h.transaction).not.toHaveBeenCalled()
        expect(h.state.tickets).toEqual(before)
        expect(h.findTickets).toHaveBeenCalledWith({
            orderBy: { id: "asc" },
            select: expect.objectContaining({ legacyEquipments: true })
        })
    })

    it("preflights every ticket and reports every blocker before any write", async () => {
        const h = harness([
            ticket(),
            ticket({ id: 2, legacyEquipments: "broken" }),
            ticket({ id: 3, legacyEquipments: [{ id: 99, quantity: 1 }] }),
            ticket({ id: 4, equipments: [row({ allocatedQuantity: 2 })] })
        ])
        const report = await backfillTicketEquipment(h.db, { apply: true })
        expect(report.success).toBe(false)
        expect(report.ready).toEqual([1])
        expect(report.blockers).toEqual([
            { ticketId: 2, reason: "invalid-json" },
            { ticketId: 3, reason: "dangling-equipment-reference" },
            { ticketId: 4, reason: "conflicting-existing-rows" }
        ])
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it.each(["string", "native"])(
        "transfers %s archive unchanged, guards the original snapshot, and marks last",
        async (format) => {
            const archive =
                format === "string"
                    ? '[ { "quantity": 3, "id": 7 } ]'
                    : [{ id: 7, quantity: 3 }]
            const h = harness([
                ticket({ legacyEquipments: archive, equipmentRevision: 4 })
            ])
            const result = await backfillTicketEquipment(h.db, { apply: true })
            expect(result.success).toBe(true)
            expect(result.applied).toEqual([1])
            expect(h.transaction).toHaveBeenCalledWith(expect.any(Function), {
                isolationLevel: "Serializable"
            })
            const guard = {
                id: 1,
                equipmentRevision: 4,
                equipmentMigratedAt: null,
                legacyEquipments: { equals: archive },
                validated: null
            }
            expect(h.updateMany).toHaveBeenNthCalledWith(1, {
                where: guard,
                data: { equipmentRevision: { increment: 1 } }
            })
            expect(h.createMany).toHaveBeenCalledWith({
                data: [{ ticketId: 1, ...row() }]
            })
            expect(h.updateMany).toHaveBeenNthCalledWith(2, {
                where: { ...guard, equipmentRevision: 5 },
                data: { equipmentMigratedAt: expect.any(Date) }
            })
            expect(h.createMany.mock.invocationCallOrder[0]).toBeLessThan(
                h.updateMany.mock.invocationCallOrder[1]!
            )
            expect(h.state.tickets[0]).toEqual({
                ...ticket({ legacyEquipments: archive, equipmentRevision: 5 }),
                equipments: [row()],
                equipmentMigratedAt: expect.any(Date)
            })
        }
    )

    it("uses unknown inclusion for validated tickets and guards validation state", async () => {
        const validated = new Date("2025-01-01")
        const h = harness([ticket({ validated })])
        await backfillTicketEquipment(h.db, { apply: true })
        expect(h.createMany).toHaveBeenCalledWith({
            data: [{ ticketId: 1, ...row({ includedInContract: null }) }]
        })
        expect(h.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ validated })
            })
        )
    })

    it("is idempotent and skips completed archives without parsing them", async () => {
        const h = harness([
            ticket(),
            ticket({
                id: 2,
                equipmentMigratedAt: new Date(),
                legacyEquipments: null
            })
        ])
        await backfillTicketEquipment(h.db, { apply: true })
        h.transaction.mockClear()
        const second = await backfillTicketEquipment(h.db, { apply: true })
        expect(second.skipped).toEqual([1, 2])
        expect(second.applied).toEqual([])
        expect(second.success).toBe(true)
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("accepts exact partial rows, inserts only missing rows, and never overwrites", async () => {
        const h = harness([
            ticket({
                legacyEquipments: [
                    { id: 7, quantity: 3 },
                    { id: 8, quantity: 2 }
                ],
                equipments: [row()]
            })
        ])
        await backfillTicketEquipment(h.db, { apply: true })
        expect(h.createMany).toHaveBeenCalledWith({
            data: [
                {
                    ticketId: 1,
                    ...row({
                        equipmentId: 8,
                        requestedQuantity: 2,
                        allocatedQuantity: 2
                    })
                }
            ]
        })
        expect(h.state.tickets[0]!.equipments).toHaveLength(2)
    })

    it("marks an exact already-transferred ticket without inserting again", async () => {
        const h = harness([ticket({ equipments: [row()] })])
        expect(
            (await backfillTicketEquipment(h.db, { apply: true })).success
        ).toBe(true)
        expect(h.createMany).not.toHaveBeenCalled()
        expect(h.state.tickets[0]!.equipmentMigratedAt).toBeInstanceOf(Date)
    })

    it.each([
        row({ equipmentId: 8 }),
        row({ requestedQuantity: 4 }),
        row({ allocatedQuantity: 4 }),
        row({ includedInContract: null }),
        row({ includedInContract: true })
    ])("blocks existing differing/extra rows: %j", async (existing) => {
        const h = harness([ticket({ equipments: [existing] })])
        expect(
            (await backfillTicketEquipment(h.db, { apply: true })).blockers
        ).toEqual([{ ticketId: 1, reason: "conflicting-existing-rows" }])
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it.each([-1, 1.5, 2147483647])(
        "blocks unsafe revision %s",
        async (equipmentRevision) => {
            const h = harness([ticket({ equipmentRevision })])
            expect(
                (await backfillTicketEquipment(h.db, { apply: true }))
                    .blockers[0]?.reason
            ).toBe("invalid-revision")
            expect(h.transaction).not.toHaveBeenCalled()
        }
    )

    it.each([[], "[]"])(
        "marks valid empty archive %j",
        async (legacyEquipments) => {
            const h = harness([ticket({ legacyEquipments })])
            expect(
                (await backfillTicketEquipment(h.db, { apply: true })).success
            ).toBe(true)
            expect(h.createMany).not.toHaveBeenCalled()
            expect(h.state.tickets[0]!.equipmentMigratedAt).toBeInstanceOf(Date)
        }
    )

    it.each(["tickets", "catalogue"])(
        "sanitizes %s read failures",
        async (source) => {
            const h = harness()
            const read = source === "tickets" ? h.findTickets : h.findCatalogue
            read.mockRejectedValueOnce(new Error("secret database credentials"))
            const result = await backfillTicketEquipment(h.db, { apply: true })
            expect(result.blockers).toEqual([
                { ticketId: null, reason: "preflight-read-failed" }
            ])
            expect(JSON.stringify(result)).not.toContain("secret")
            expect(h.transaction).not.toHaveBeenCalled()
        }
    )

    it("aborts before inserting if archive/revision/validation guard no longer matches", async () => {
        const h = harness()
        h.updateMany.mockResolvedValueOnce({ count: 0 })
        const result = await backfillTicketEquipment(h.db, { apply: true })
        expect(result.success).toBe(false)
        expect(h.createMany).not.toHaveBeenCalled()
        expect(h.state.tickets).toEqual([ticket()])
    })

    it("rechecks existing rows inside the transaction", async () => {
        const h = harness()
        h.findRows.mockResolvedValueOnce([row({ allocatedQuantity: 9 })])
        const result = await backfillTicketEquipment(h.db, { apply: true })
        expect(result.success).toBe(false)
        expect(h.createMany).not.toHaveBeenCalled()
        expect(h.state.tickets).toEqual([ticket()])
    })

    it.each(["read", "insert", "marker", "serialization"])(
        "rolls back %s failure and stops subsequent tickets; reports earlier commits",
        async (failure) => {
            const h = harness([ticket(), ticket({ id: 2 }), ticket({ id: 3 })])
            h.transaction.mockImplementationOnce(async () => {
                // Simulate a previously committed transaction independently of
                // the failing transaction's working-copy rollback.
                h.state.tickets[0]!.equipmentMigratedAt = new Date()
            })
            if (failure === "read")
                h.findRows.mockRejectedValueOnce(new Error("private"))
            if (failure === "insert")
                h.createMany.mockRejectedValueOnce(new Error("private"))
            if (failure === "marker") {
                h.updateMany
                    .mockResolvedValueOnce({ count: 1 })
                    .mockResolvedValueOnce({ count: 0 })
            }
            if (failure === "serialization")
                h.transaction.mockRejectedValueOnce(new Error("private"))
            const result = await backfillTicketEquipment(h.db, { apply: true })
            expect(result.applied).toEqual([1])
            expect(result.blockers).toEqual([
                {
                    ticketId: 2,
                    reason: "transaction-failed-repreflight-required"
                }
            ])
            expect(h.transaction).toHaveBeenCalledTimes(2)
            expect(h.state.tickets[1]).toEqual(ticket({ id: 2 }))
            expect(h.state.tickets[2]).toEqual(ticket({ id: 3 }))
            expect(JSON.stringify(result)).not.toContain("private")
        }
    )
})
