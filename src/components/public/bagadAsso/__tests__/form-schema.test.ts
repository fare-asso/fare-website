import { describe, expect, it } from "vitest"

import { validBagadAssoForm } from "@/test/factories/bagadAsso"

import { BagadAssoFormSchema } from "../form-schema"

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
