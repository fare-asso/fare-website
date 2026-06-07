import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { AddEluSchema, BulkImportEluSchema, EditEluSchema } from "../elu"

const isError = (out: unknown): boolean => out instanceof type.errors

describe("AddEluSchema", () => {
    it("accepts a valid payload", () => {
        expect(
            isError(
                AddEluSchema({
                    conseilId: 1,
                    name: "Jean",
                    position: "Président"
                })
            )
        ).toBe(false)
    })

    it("accepts an optional description", () => {
        expect(
            isError(
                AddEluSchema({
                    conseilId: 1,
                    name: "Jean",
                    position: "Président",
                    description: "Membre"
                })
            )
        ).toBe(false)
    })

    it("rejects a non-integer conseilId", () => {
        expect(
            isError(
                AddEluSchema({ conseilId: 1.5, name: "Jean", position: "P" })
            )
        ).toBe(true)
    })

    it("rejects a conseilId below 1", () => {
        expect(
            isError(AddEluSchema({ conseilId: 0, name: "Jean", position: "P" }))
        ).toBe(true)
    })

    it("rejects an empty name", () => {
        expect(
            isError(AddEluSchema({ conseilId: 1, name: "", position: "P" }))
        ).toBe(true)
    })

    it("rejects an empty position", () => {
        expect(
            isError(AddEluSchema({ conseilId: 1, name: "Jean", position: "" }))
        ).toBe(true)
    })

    it("accepts an empty description", () => {
        expect(
            isError(
                AddEluSchema({
                    conseilId: 1,
                    name: "Jean",
                    position: "P",
                    description: ""
                })
            )
        ).toBe(false)
    })

    it("rejects a description longer than 1000 chars", () => {
        expect(
            isError(
                AddEluSchema({
                    conseilId: 1,
                    name: "Jean",
                    position: "P",
                    description: "x".repeat(1001)
                })
            )
        ).toBe(true)
    })
})

describe("EditEluSchema", () => {
    it("accepts a valid payload", () => {
        expect(
            isError(
                EditEluSchema({
                    id: 1,
                    conseilId: 1,
                    name: "Jean",
                    position: "P"
                })
            )
        ).toBe(false)
    })

    it("requires an id", () => {
        expect(
            isError(
                EditEluSchema({ conseilId: 1, name: "Jean", position: "P" })
            )
        ).toBe(true)
    })
})

describe("BulkImportEluSchema", () => {
    it("accepts at least one row", () => {
        expect(
            isError(
                BulkImportEluSchema({
                    conseilId: 1,
                    elus: [{ name: "Jean", position: "P" }]
                })
            )
        ).toBe(false)
    })

    it("rejects an empty elus array", () => {
        expect(isError(BulkImportEluSchema({ conseilId: 1, elus: [] }))).toBe(
            true
        )
    })

    it("rejects a row with an empty name", () => {
        expect(
            isError(
                BulkImportEluSchema({
                    conseilId: 1,
                    elus: [{ name: "", position: "P" }]
                })
            )
        ).toBe(true)
    })
})
