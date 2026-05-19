import { describe, expect, it } from "vitest"

import { MemberServerSchema } from "../members"

const validMember = () => ({
    lastName: "Martin",
    firstName: "Lea",
    position: "Tresoriere",
    email: "lea@example.com",
    facebook: "",
    instagram: "",
    twitter: "",
    picturePath: "members/lea.png"
})

describe("MemberServerSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(MemberServerSchema.safeParse(validMember()).success).toBe(true)
    })

    it("rejects an invalid email", () => {
        const res = MemberServerSchema.safeParse({
            ...validMember(),
            email: "not-an-email"
        })
        expect(res.success).toBe(false)
    })

    it("rejects an empty picture path", () => {
        const res = MemberServerSchema.safeParse({
            ...validMember(),
            picturePath: ""
        })
        expect(res.success).toBe(false)
    })

    it("accepts an empty string for optional social URLs", () => {
        const res = MemberServerSchema.safeParse({
            ...validMember(),
            facebook: "",
            instagram: "",
            twitter: ""
        })
        expect(res.success).toBe(true)
    })

    it("rejects a malformed social URL", () => {
        const res = MemberServerSchema.safeParse({
            ...validMember(),
            facebook: "not-a-url"
        })
        expect(res.success).toBe(false)
    })

    it("accepts a valid social URL", () => {
        const res = MemberServerSchema.safeParse({
            ...validMember(),
            facebook: "https://facebook.com/lea"
        })
        expect(res.success).toBe(true)
    })
})
