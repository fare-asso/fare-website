import { describe, expect, it } from "vitest"

import {
    parseBackfillArguments,
    validateBackfillTarget
} from "../../../../prisma/backfillBagadTicketEquipment"

describe("backfill CLI safety options", () => {
    it("defaults to dry-run and requires opt-in for replacement equipment", () => {
        expect(
            parseBackfillArguments(["--target=db.example.org:5432/postgres"])
        ).toEqual({
            target: "db.example.org:5432/postgres",
            apply: false,
            fillMissingEquipment: false
        })
        expect(
            parseBackfillArguments([
                "--target=db.example.org:5432/postgres",
                "--apply",
                "--fill-missing-equipment"
            ])
        ).toEqual({
            target: "db.example.org:5432/postgres",
            apply: true,
            fillMissingEquipment: true
        })
    })

    it("rejects duplicate flags and credential-bearing targets", () => {
        expect(() =>
            parseBackfillArguments([
                "--target=db.example.org:5432/postgres",
                "--fill-missing-equipment",
                "--fill-missing-equipment"
            ])
        ).toThrow("invalid-arguments")
        expect(() =>
            parseBackfillArguments([
                "--target=postgresql://user:secret@db.example.org/postgres"
            ])
        ).toThrow("invalid-target")
    })

    it("refuses to use a different database from the explicit target", () => {
        expect(() =>
            validateBackfillTarget(
                "postgresql://user:secret@other.example.org:5432/postgres",
                "db.example.org:5432/postgres"
            )
        ).toThrow("target-mismatch")
    })
})
