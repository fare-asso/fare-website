import { describe, expect, it } from "vitest"

import { validBagadAssoForm } from "@/test/factories/bagadAsso"

import {
    BagadAssoClientFormSchema,
    BagadAssoEquipmentInputSchema,
    BagadAssoFormSchema
} from "../form-schema"

describe("BagadAssoFormSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(
            BagadAssoFormSchema.safeParse(validBagadAssoForm()).success
        ).toBe(true)
    })

    it("rejects a phone number containing non-digits", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ referentPhone: "06123456ab" })
        )
        expect(res.success).toBe(false)
    })

    it("rejects a phone number that is not 10 digits", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ referentPhone: "0612345" })
        )
        expect(res.success).toBe(false)
    })

    it("rejects an empty equipment selection", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ equipment: JSON.stringify([]) })
        )
        expect(res.success).toBe(false)
    })

    it("rejects unparsable equipment json", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ equipment: "not-json" })
        )
        expect(res.success).toBe(false)
    })

    it.each([
        "null",
        "{}",
        "[null]",
        '[{"id":1}]',
        '[{"quantity":2}]',
        '[{"id":"1","quantity":2}]',
        '[{"id":1,"quantity":"2"}]',
        '[{"id":0,"quantity":1}]',
        '[{"id":-1,"quantity":1}]',
        '[{"id":1.5,"quantity":1}]',
        '[{"id":2147483648,"quantity":1}]',
        '[{"id":1,"quantity":0}]',
        '[{"id":1,"quantity":-1}]',
        '[{"id":1,"quantity":1.5}]',
        '[{"id":1,"quantity":2147483648}]',
        '[{"id":1,"quantity":1e400}]',
        '[{"id":1,"quantity":2},{"id":1,"quantity":3}]'
    ])("rejects invalid equipment entries in both schemas: %s", (equipment) => {
        const input = validBagadAssoForm({ equipment })
        expect(BagadAssoFormSchema.safeParse(input).success).toBe(false)
        expect(BagadAssoClientFormSchema.safeParse(input).success).toBe(false)
        expect(BagadAssoEquipmentInputSchema.safeParse(equipment).success).toBe(
            false
        )
    })

    it("keeps string transport and exposes validated parsed entries", () => {
        const equipment =
            '[{"id":2147483647,"quantity":2147483647},{"id":1,"quantity":1}]'
        const result = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ equipment })
        )
        expect(result.success).toBe(true)
        if (result.success) expect(result.data.equipment).toBe(equipment)
        expect(BagadAssoEquipmentInputSchema.safeParse(equipment)).toEqual({
            success: true,
            data: [
                { id: 2147483647, quantity: 2147483647 },
                { id: 1, quantity: 1 }
            ]
        })
    })

    it("rejects an end date before the start date", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({
                eventDate: new Date("2026-09-02T00:00:00Z"),
                eventEndDate: new Date("2026-09-01T00:00:00Z")
            })
        )
        expect(res.success).toBe(false)
        if (!res.success) {
            expect(res.error.issues[0]?.path).toEqual(["eventEndDate"])
        }
    })

    it("accepts an end date equal to the start date", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({
                eventDate: new Date("2026-09-01T00:00:00Z"),
                eventEndDate: new Date("2026-09-01T00:00:00Z")
            })
        )
        expect(res.success).toBe(true)
    })

    it("requires termsAccepted to be true", () => {
        const res = BagadAssoFormSchema.safeParse({
            ...validBagadAssoForm(),
            termsAccepted: false
        })
        expect(res.success).toBe(false)
    })

    it("coerces an ISO string event date", () => {
        const res = BagadAssoFormSchema.safeParse({
            ...validBagadAssoForm(),
            eventDate: "2026-09-01T00:00:00Z"
        })
        expect(res.success).toBe(true)
        if (res.success) {
            expect(res.data.eventDate).toBeInstanceOf(Date)
        }
    })

    it("rejects an invalid association email", () => {
        const res = BagadAssoFormSchema.safeParse(
            validBagadAssoForm({ associationEmail: "nope" })
        )
        expect(res.success).toBe(false)
    })
})
