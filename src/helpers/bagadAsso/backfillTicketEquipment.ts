import type { Prisma, PrismaClient } from "../../generated/prisma/client"
import { tryCatch } from "../../lib/utils"

export type BackfillDatabase = Pick<
    PrismaClient,
    "bagadAssoTicket" | "bagadAssoEquipment" | "$transaction"
>

export type EquipmentTransfer = {
    equipmentId: number
    requestedQuantity: number
    allocatedQuantity: number
    includedInContract: boolean | null
}

type BackfillBlocker = {
    ticketId: number | null
    reason: string
}

export type BackfillReport = {
    success: boolean
    mode: "dry-run" | "apply"
    scanned: number
    skipped: number[]
    ready: number[]
    applied: number[]
    blockers: BackfillBlocker[]
    replacementEquipmentIds?: number[]
}

const ticketSelect = {
    id: true,
    legacyEquipments: true,
    equipmentRevision: true,
    equipmentMigratedAt: true,
    validated: true,
    equipments: {
        select: {
            equipmentId: true,
            requestedQuantity: true,
            allocatedQuantity: true,
            includedInContract: true
        }
    }
} as const

type TicketSnapshot = Prisma.BagadAssoTicketGetPayload<{
    select: typeof ticketSelect
}>

type TransferPlan = {
    ticket: TicketSnapshot
    // Only valid string/native-array archives reach the write guard.
    archive: Prisma.InputJsonValue
    rows: EquipmentTransfer[]
    replacementIds: number[]
}

type ParsedEquipment = { id: number; quantity: number }
type ParseResult =
    | { success: true; value: ParsedEquipment[] }
    | { success: false; error: string }

function positivePgInt(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value > 0 &&
        value <= 2147483647
    )
}

/** Strict on purpose: never silently coerce, merge duplicates or drop fields. */
export function parseLegacyTicketEquipment(archive: unknown): ParseResult {
    let value: unknown = archive
    if (typeof archive === "string") {
        const decoded = tryCatch((): unknown => JSON.parse(archive))
        if (!decoded.success) {
            return { success: false, error: "invalid-json" }
        }
        value = decoded.value
    }
    if (!Array.isArray(value)) {
        return { success: false, error: "expected-array" }
    }
    const ids = new Set<number>()
    const rows: ParsedEquipment[] = []
    for (const item of value) {
        if (
            typeof item !== "object" ||
            item === null ||
            Array.isArray(item) ||
            Object.keys(item).length !== 2 ||
            !("id" in item) ||
            !("quantity" in item)
        ) {
            return { success: false, error: "invalid-fields" }
        }
        if (!positivePgInt(item.id) || !positivePgInt(item.quantity)) {
            return { success: false, error: "invalid-positive-pg-int" }
        }
        if (ids.has(item.id)) {
            return { success: false, error: "duplicate-equipment-id" }
        }
        ids.add(item.id)
        rows.push({ id: item.id, quantity: item.quantity })
    }
    return { success: true, value: rows }
}

function hasConflictingRows(
    existing: EquipmentTransfer[],
    expected: EquipmentTransfer[]
): boolean {
    const byId = new Map(expected.map((row) => [row.equipmentId, row]))
    return existing.some((row) => {
        const match = byId.get(row.equipmentId)
        return (
            !match ||
            row.requestedQuantity !== match.requestedQuantity ||
            row.allocatedQuantity !== match.allocatedQuantity ||
            row.includedInContract !== match.includedInContract
        )
    })
}

function buildPlan(
    ticket: TicketSnapshot,
    catalogue: Set<number>,
    fillMissingEquipment: boolean
): TransferPlan | BackfillBlocker {
    const parsed = parseLegacyTicketEquipment(ticket.legacyEquipments)
    if (!parsed.success) {
        return { ticketId: ticket.id, reason: parsed.error }
    }
    if (
        !Number.isInteger(ticket.equipmentRevision) ||
        ticket.equipmentRevision < 0 ||
        ticket.equipmentRevision >= 2147483647
    ) {
        return { ticketId: ticket.id, reason: "invalid-revision" }
    }
    const replacementIds = parsed.value
        .filter((row) => !catalogue.has(row.id))
        .map((row) => row.id)
    if (replacementIds.length > 0 && !fillMissingEquipment) {
        return { ticketId: ticket.id, reason: "dangling-equipment-reference" }
    }
    const rows = parsed.value.map((row): EquipmentTransfer => ({
        equipmentId: row.id,
        requestedQuantity: row.quantity,
        allocatedQuantity: row.quantity,
        includedInContract: ticket.validated === null ? false : null
    }))
    if (hasConflictingRows(ticket.equipments, rows)) {
        return { ticketId: ticket.id, reason: "conflicting-existing-rows" }
    }
    // Parsing above guarantees a string or native JSON array, never JSON null.
    const archive = ticket.legacyEquipments
    if (archive === null) {
        return { ticketId: ticket.id, reason: "expected-array" }
    }
    return { ticket, archive, rows, replacementIds }
}

async function transferTicket(
    tx: Prisma.TransactionClient,
    plan: TransferPlan
): Promise<void> {
    const { ticket, archive, rows } = plan
    const guard = {
        id: ticket.id,
        equipmentMigratedAt: null,
        equipmentRevision: ticket.equipmentRevision,
        legacyEquipments: { equals: archive },
        validated: ticket.validated
    }
    // Claim the parent row before inspecting children. Runtime writers must
    // guard/increment this same revision. The claim rolls back on any failure.
    const claim = await tx.bagadAssoTicket.updateMany({
        where: guard,
        data: { equipmentRevision: { increment: 1 } }
    })
    if (claim.count !== 1) {
        throw new Error("concurrent-ticket-change")
    }
    const existing = await tx.bagadAssoTicketEquipment.findMany({
        where: { ticketId: ticket.id },
        select: ticketSelect.equipments.select
    })
    if (hasConflictingRows(existing, rows)) {
        throw new Error("concurrent-equipment-change")
    }
    if (plan.replacementIds.length > 0) {
        const created = await tx.bagadAssoEquipment.createMany({
            data: plan.replacementIds.map((id) => ({
                id,
                name: `Matériel #${id}`,
                quantity: 0,
                deposit: 0
            })),
            skipDuplicates: true
        })
        if (created.count > 0) {
            // Explicit historical IDs must not collide with future autoincrement IDs.
            await tx.$queryRaw`SELECT setval(
                pg_get_serial_sequence('"BagadAssoEquipment"', 'id'),
                GREATEST(
                    (SELECT MAX(id) FROM "BagadAssoEquipment"),
                    nextval(pg_get_serial_sequence('"BagadAssoEquipment"', 'id'))
                ),
                true
            )`
        }
    }
    const existingIds = new Set(existing.map((row) => row.equipmentId))
    const missing = rows.filter((row) => !existingIds.has(row.equipmentId))
    if (missing.length > 0) {
        await tx.bagadAssoTicketEquipment.createMany({
            data: missing.map((row) => ({ ticketId: ticket.id, ...row }))
        })
    }
    const marked = await tx.bagadAssoTicket.updateMany({
        where: { ...guard, equipmentRevision: ticket.equipmentRevision + 1 },
        data: { equipmentMigratedAt: new Date() }
    })
    if (marked.count !== 1) {
        throw new Error("concurrent-ticket-change")
    }
}

/**
 * Full read-only preflight precedes every write. Apply is deliberately opt-in.
 * On a transactional failure stop; earlier committed tickets remain resumable.
 * Reports contain IDs/reason codes only, never legacy data or database errors.
 */
export async function backfillTicketEquipment(
    db: BackfillDatabase,
    options: { apply?: boolean; fillMissingEquipment?: boolean } = {}
): Promise<BackfillReport> {
    const report: BackfillReport = {
        success: false,
        mode: options.apply === true ? "apply" : "dry-run",
        scanned: 0,
        skipped: [],
        ready: [],
        applied: [],
        blockers: []
    }
    const snapshot = await tryCatch(async () => {
        const tickets = await db.bagadAssoTicket.findMany({
            select: ticketSelect,
            orderBy: { id: "asc" }
        })
        const catalogue = await db.bagadAssoEquipment.findMany({
            select: { id: true }
        })
        return { tickets, catalogue }
    })
    if (!snapshot.success) {
        report.blockers.push({
            ticketId: null,
            reason: "preflight-read-failed"
        })
        return report
    }
    const catalogue = new Set(snapshot.value.catalogue.map((row) => row.id))
    const plans: TransferPlan[] = []
    report.scanned = snapshot.value.tickets.length
    for (const ticket of snapshot.value.tickets) {
        if (ticket.equipmentMigratedAt !== null) {
            report.skipped.push(ticket.id)
            continue
        }
        const plan = buildPlan(
            ticket,
            catalogue,
            options.fillMissingEquipment === true
        )
        if ("reason" in plan) {
            report.blockers.push(plan)
        } else {
            plans.push(plan)
            report.ready.push(ticket.id)
        }
    }
    const replacements = [
        ...new Set(plans.flatMap((plan) => plan.replacementIds))
    ].sort((a, b) => a - b)
    if (replacements.length > 0) report.replacementEquipmentIds = replacements
    if (report.blockers.length > 0) return report
    if (options.apply === true) {
        for (const plan of plans) {
            // Sequential commits bound contention and make partial progress
            // explicit. Never automatically retry a changed preflight snapshot.
            // oxlint-disable-next-line no-await-in-loop
            const result = await tryCatch(() =>
                db.$transaction((tx) => transferTicket(tx, plan), {
                    isolationLevel: "Serializable"
                })
            )
            if (!result.success) {
                report.blockers.push({
                    ticketId: plan.ticket.id,
                    reason: "transaction-failed-repreflight-required"
                })
                return report
            }
            report.applied.push(plan.ticket.id)
        }
    }
    report.success = true
    return report
}
