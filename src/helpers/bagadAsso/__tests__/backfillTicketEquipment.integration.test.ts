import { execFile } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import { setTimeout } from "node:timers/promises"
import { promisify } from "node:util"

import { PrismaPg } from "@prisma/adapter-pg"
import { env as processEnv } from "std-env"
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it
} from "vitest"

import { PrismaClient, type Prisma } from "@/generated/prisma/client"
import { tryCatch } from "@/lib/utils"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

import { backfillTicketEquipment } from "../backfillTicketEquipment"

const exec = promisify(execFile)
const enabled = processEnv.BAGAD_MIGRATION_INTEGRATION === "1"
const name = `fare-bagad-migration-${randomUUID()}`
const databaseName = "fare_bagad_migration_test"
let started = false
let client: PrismaClient | undefined
let connectionString = ""
let target = ""
let upgradeProof: {
    legacyEquipments: Prisma.JsonValue
    equipmentMigratedAt: Date | null
} | null = null

function db(): PrismaClient {
    if (!client)
        throw new Error("Disposable PostgreSQL client is not initialized")
    return client
}

async function createLegacy(
    id: number,
    archive: Prisma.InputJsonValue,
    validated: Date | null = null,
    deleted: Date | null = null
): Promise<void> {
    const { legacyEquipments: _archive, ...record } = bagadAssoTicketRecord()
    await db().bagadAssoTicket.create({
        data: {
            ...record,
            id,
            legacyEquipments: archive,
            equipmentMigratedAt: null,
            validated,
            deleted
        }
    })
}

// Opt-in only: the test owns a unique container and never loads .env/database URLs.
describe.skipIf(!enabled)(
    "Bagad'Asso migration on disposable PostgreSQL",
    () => {
        beforeAll(async () => {
            await exec("docker", [
                "run",
                "--detach",
                "--rm",
                "--name",
                name,
                "-e",
                "POSTGRES_USER=test",
                "-e",
                "POSTGRES_PASSWORD=test",
                "-e",
                `POSTGRES_DB=${databaseName}`,
                "-p",
                "127.0.0.1::5432",
                "postgres:17-alpine"
            ])
            started = true
            let ready = false
            for (let attempt = 0; attempt < 60; attempt++) {
                // Polling is intentionally sequential and bounded.
                // oxlint-disable-next-line no-await-in-loop
                const result = await tryCatch(() =>
                    exec("docker", [
                        "exec",
                        name,
                        "pg_isready",
                        "-U",
                        "test",
                        "-d",
                        databaseName
                    ])
                )
                if (result.success) {
                    ready = true
                    break
                }
                // oxlint-disable-next-line no-await-in-loop
                await setTimeout(500)
            }
            if (!ready)
                throw new Error("Disposable PostgreSQL did not become ready")
            const portResult = await exec("docker", ["port", name, "5432/tcp"])
            const port = portResult.stdout.trim().split(":").at(-1)
            if (!port || !/^\d+$/.test(port))
                throw new Error("Invalid disposable PostgreSQL port")
            target = `127.0.0.1:${port}/${databaseName}`
            connectionString = `postgresql://test:test@${target}`
            const baseline = await exec(
                "upm",
                [
                    "exec",
                    "prisma",
                    "migrate",
                    "diff",
                    "--from-empty",
                    "--to-schema",
                    "src/helpers/bagadAsso/__tests__/fixtures/legacy-bagad-schema.prisma",
                    "--script"
                ],
                {
                    env: {
                        ...processEnv,
                        SUPABASE_POSTGRES_PRISMA_DIRECT_URL:
                            "postgresql://offline:offline@127.0.0.1:1/offline"
                    }
                }
            )
            await exec("docker", [
                "exec",
                name,
                "psql",
                "-U",
                "test",
                "-d",
                databaseName,
                "-v",
                "ON_ERROR_STOP=1",
                "-c",
                baseline.stdout
            ])
            client = new PrismaClient({
                adapter: new PrismaPg({ connectionString })
            })
            // Insert real old-format data BEFORE applying the CLI-generated migration.
            await db()
                .$executeRaw`INSERT INTO "BagadAssoEquipment" (id, name) VALUES (77, 'Historical equipment')`
            await db()
                .$executeRaw`INSERT INTO "BagadAssoTicket" (id, association, "firstName", "lastName", "eventName", "eventType", "eventDate", "eventAddr", "associationEmail", "representativeEmail", equipments)
            VALUES (77, 'Historical association', 'Test', 'User', 'Test event', 'Test', NOW(), 'Rennes', 'asso@example.com', 'user@example.com', ${JSON.stringify('[{"id":77,"quantity":3}]')}::jsonb)`
            const migration = await readFile(
                "migrations/20261017120000_normalize_bagad_ticket_equipment/migration.sql",
                "utf8"
            )
            await exec("docker", [
                "exec",
                name,
                "psql",
                "-U",
                "test",
                "-d",
                databaseName,
                "-v",
                "ON_ERROR_STOP=1",
                "-c",
                migration
            ])
            upgradeProof = await db().bagadAssoTicket.findUnique({
                where: { id: 77 },
                select: { legacyEquipments: true, equipmentMigratedAt: true }
            })
        }, 90000)

        beforeEach(async () => {
            await db().bagadAssoTicket.deleteMany()
            await db().bagadAssoEquipment.deleteMany()
            await db().bagadAssoEquipment.createMany({
                data: [
                    { id: 7, name: "Barnum", quantity: 1, deposit: 50 },
                    { id: 8, name: "Table", quantity: 1, deposit: 10 }
                ]
            })
        })

        afterEach(async () => {
            if (client) {
                await client.$executeRaw`DROP TRIGGER IF EXISTS bagad_test_fail ON "BagadAssoTicketEquipment"`
                await client.$executeRaw`DROP FUNCTION IF EXISTS bagad_test_fail()`
            }
        })

        afterAll(async () => {
            const activeClient = client
            if (activeClient) await tryCatch(() => activeClient.$disconnect())
            if (started) await exec("docker", ["rm", "--force", name])
        })

        it("preserves a pre-existing JSON string through the additive schema migration", () => {
            expect(upgradeProof).toEqual({
                legacyEquipments: '[{"id":77,"quantity":3}]',
                equipmentMigratedAt: null
            })
        })

        it("dry-runs, migrates all ticket states, preserves archives and safely reruns", async () => {
            await createLegacy(1, '[{"id":7,"quantity":3}]')
            await createLegacy(2, [{ id: 8, quantity: 2 }])
            await createLegacy(3, [{ id: 7, quantity: 5 }], new Date())
            await createLegacy(4, [{ id: 8, quantity: 4 }], null, new Date())
            await createLegacy(5, [])
            const preview = await backfillTicketEquipment(db())
            expect(preview).toMatchObject({
                success: true,
                mode: "dry-run",
                ready: [1, 2, 3, 4, 5],
                applied: []
            })
            expect(await db().bagadAssoTicketEquipment.count()).toBe(0)
            expect(
                await db().bagadAssoTicket.count({
                    where: { equipmentMigratedAt: { not: null } }
                })
            ).toBe(0)
            const applied = await backfillTicketEquipment(db(), { apply: true })
            expect(applied).toMatchObject({
                success: true,
                applied: [1, 2, 3, 4, 5]
            })
            expect(
                await db().bagadAssoTicketEquipment.findMany({
                    orderBy: { ticketId: "asc" }
                })
            ).toEqual([
                {
                    ticketId: 1,
                    equipmentId: 7,
                    requestedQuantity: 3,
                    allocatedQuantity: 3,
                    includedInContract: false
                },
                {
                    ticketId: 2,
                    equipmentId: 8,
                    requestedQuantity: 2,
                    allocatedQuantity: 2,
                    includedInContract: false
                },
                {
                    ticketId: 3,
                    equipmentId: 7,
                    requestedQuantity: 5,
                    allocatedQuantity: 5,
                    includedInContract: null
                },
                {
                    ticketId: 4,
                    equipmentId: 8,
                    requestedQuantity: 4,
                    allocatedQuantity: 4,
                    includedInContract: false
                }
            ])
            expect(
                (
                    await db().bagadAssoTicket.findUniqueOrThrow({
                        where: { id: 1 }
                    })
                ).legacyEquipments
            ).toBe('[{"id":7,"quantity":3}]')
            expect(
                await backfillTicketEquipment(db(), { apply: true })
            ).toMatchObject({
                success: true,
                skipped: [1, 2, 3, 4, 5],
                applied: []
            })
            expect(await db().bagadAssoTicketEquipment.count()).toBe(4)
            // Later allocation changes never rewrite the original request.
            await db().bagadAssoTicketEquipment.update({
                where: {
                    ticketId_equipmentId: { ticketId: 1, equipmentId: 7 }
                },
                data: { allocatedQuantity: 1 }
            })
            await backfillTicketEquipment(db(), { apply: true })
            expect(
                await db().bagadAssoTicketEquipment.findUniqueOrThrow({
                    where: {
                        ticketId_equipmentId: { ticketId: 1, equipmentId: 7 }
                    }
                })
            ).toMatchObject({ requestedQuantity: 3, allocatedQuantity: 1 })
            await expect(
                db().bagadAssoEquipment.delete({ where: { id: 7 } })
            ).rejects.toMatchObject({ code: "P2003" })
            await db().bagadAssoTicket.delete({ where: { id: 1 } })
            expect(
                await db().bagadAssoTicketEquipment.count({
                    where: { ticketId: 1 }
                })
            ).toBe(0)
        })

        it.each([
            "not json",
            [
                { id: 7, quantity: 1 },
                { id: 7, quantity: 2 }
            ],
            [{ id: 999, quantity: 1 }],
            [{ id: 7, quantity: 0 }],
            [{ id: 7, quantity: 1, extra: "do not discard" }]
        ])(
            "blocks every write if any legacy ticket is invalid: %j",
            async (archive) => {
                await createLegacy(1, archive)
                await createLegacy(2, [{ id: 8, quantity: 2 }])
                const result = await backfillTicketEquipment(db(), {
                    apply: true
                })
                expect(result.success).toBe(false)
                expect(result.applied).toEqual([])
                expect(result.blockers).toHaveLength(1)
                expect(await db().bagadAssoTicketEquipment.count()).toBe(0)
                expect(
                    await db().bagadAssoTicket.count({
                        where: { equipmentMigratedAt: { not: null } }
                    })
                ).toBe(0)
            }
        )

        it("resumes matching partial rows but refuses conflicting rows", async () => {
            await createLegacy(1, [
                { id: 7, quantity: 2 },
                { id: 8, quantity: 3 }
            ])
            await db().bagadAssoTicketEquipment.create({
                data: {
                    ticketId: 1,
                    equipmentId: 7,
                    requestedQuantity: 2,
                    allocatedQuantity: 2,
                    includedInContract: false
                }
            })
            expect(
                await backfillTicketEquipment(db(), { apply: true })
            ).toMatchObject({ success: true, applied: [1] })
            expect(await db().bagadAssoTicketEquipment.count()).toBe(2)
            await createLegacy(2, [{ id: 7, quantity: 1 }])
            await db().bagadAssoTicketEquipment.create({
                data: {
                    ticketId: 2,
                    equipmentId: 7,
                    requestedQuantity: 1,
                    allocatedQuantity: 9,
                    includedInContract: false
                }
            })
            expect(
                await backfillTicketEquipment(db(), { apply: true })
            ).toMatchObject({
                success: false,
                applied: [],
                blockers: [{ ticketId: 2, reason: "conflicting-existing-rows" }]
            })
        })

        it("rolls back the parent claim and every inserted line on a database write failure", async () => {
            await createLegacy(1, [
                { id: 7, quantity: 2 },
                { id: 8, quantity: 3 }
            ])
            await db()
                .$executeRaw`CREATE FUNCTION bagad_test_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."equipmentId" = 8 THEN RAISE EXCEPTION 'test rollback'; END IF; RETURN NEW; END $$`
            await db()
                .$executeRaw`CREATE TRIGGER bagad_test_fail BEFORE INSERT ON "BagadAssoTicketEquipment" FOR EACH ROW EXECUTE FUNCTION bagad_test_fail()`
            expect(
                await backfillTicketEquipment(db(), { apply: true })
            ).toMatchObject({
                success: false,
                applied: [],
                blockers: [
                    {
                        ticketId: 1,
                        reason: "transaction-failed-repreflight-required"
                    }
                ]
            })
            expect(await db().bagadAssoTicketEquipment.count()).toBe(0)
            expect(
                await db().bagadAssoTicket.findUniqueOrThrow({
                    where: { id: 1 }
                })
            ).toMatchObject({
                equipmentMigratedAt: null,
                equipmentRevision: 0,
                legacyEquipments: [
                    { id: 7, quantity: 2 },
                    { id: 8, quantity: 3 }
                ]
            })
        })

        it("fills missing equipment, preserves quantities, and advances the ID sequence", async () => {
            await createLegacy(1, [{ id: 999, quantity: 3 }])
            expect(
                await backfillTicketEquipment(db(), {
                    fillMissingEquipment: true
                })
            ).toMatchObject({
                success: true,
                replacementEquipmentIds: [999],
                applied: []
            })
            expect(
                await db().bagadAssoEquipment.findUnique({ where: { id: 999 } })
            ).toBeNull()
            expect(
                await backfillTicketEquipment(db(), {
                    apply: true,
                    fillMissingEquipment: true
                })
            ).toMatchObject({ success: true, applied: [1] })
            expect(
                await db().bagadAssoEquipment.findUniqueOrThrow({
                    where: { id: 999 }
                })
            ).toMatchObject({ name: "Matériel #999", quantity: 0, deposit: 0 })
            expect(
                await db().bagadAssoTicketEquipment.findFirstOrThrow()
            ).toMatchObject({ requestedQuantity: 3, allocatedQuantity: 3 })
            const next = await db().bagadAssoEquipment.create({
                data: { name: "New real equipment" }
            })
            expect(next.id).toBeGreaterThan(999)
            expect(
                await backfillTicketEquipment(db(), {
                    apply: true,
                    fillMissingEquipment: true
                })
            ).toMatchObject({ success: true, skipped: [1], applied: [] })
        })

        it("rolls back replacement catalogue records if a ticket transfer fails", async () => {
            await createLegacy(1, [
                { id: 999, quantity: 2 },
                { id: 8, quantity: 3 }
            ])
            await db()
                .$executeRaw`CREATE FUNCTION bagad_test_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."equipmentId" = 8 THEN RAISE EXCEPTION 'test rollback'; END IF; RETURN NEW; END $$`
            await db()
                .$executeRaw`CREATE TRIGGER bagad_test_fail BEFORE INSERT ON "BagadAssoTicketEquipment" FOR EACH ROW EXECUTE FUNCTION bagad_test_fail()`
            expect(
                await backfillTicketEquipment(db(), {
                    apply: true,
                    fillMissingEquipment: true
                })
            ).toMatchObject({ success: false, applied: [] })
            expect(
                await db().bagadAssoEquipment.findUnique({ where: { id: 999 } })
            ).toBeNull()
            expect(await db().bagadAssoTicketEquipment.count()).toBe(0)
            expect(
                await db().bagadAssoTicket.findUniqueOrThrow({
                    where: { id: 1 }
                })
            ).toMatchObject({ equipmentMigratedAt: null, equipmentRevision: 0 })
        })

        it("runs the actual CLI in dry-run and apply modes with an explicit local target", async () => {
            await createLegacy(1, [{ id: 999, quantity: 3 }])
            const args = [
                "exec",
                "jiti",
                "prisma/backfillBagadTicketEquipment.ts",
                `--target=${target}`,
                "--fill-missing-equipment"
            ]
            const env = {
                ...processEnv,
                SUPABASE_POSTGRES_PRISMA_DIRECT_URL: connectionString
            }
            const dryRun = await exec("upm", args, { env })
            expect(JSON.parse(dryRun.stdout)).toMatchObject({
                success: true,
                mode: "dry-run",
                applied: []
            })
            expect(await db().bagadAssoTicketEquipment.count()).toBe(0)
            const applied = await exec("upm", [...args, "--apply"], { env })
            expect(JSON.parse(applied.stdout)).toMatchObject({
                success: true,
                mode: "apply",
                applied: [1]
            })
            expect(
                await db().bagadAssoTicketEquipment.findFirstOrThrow()
            ).toMatchObject({ requestedQuantity: 3, allocatedQuantity: 3 })
        }, 30000)
    }
)
