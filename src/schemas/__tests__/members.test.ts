import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { imageFile, pdfFile } from "@/test/factories/files"
import { validAddMember, validEditMember } from "@/test/factories/members"

import { AddMemberSchema, EditMemberSchema } from "../members"

const ok = (out: unknown) => !(out instanceof type.errors)

describe("AddMemberSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(ok(AddMemberSchema(validAddMember()))).toBe(true)
    })

    it("rejects an invalid email", () => {
        expect(ok(AddMemberSchema(validAddMember({ email: "nope" })))).toBe(
            false
        )
    })

    it("rejects a missing picture", () => {
        const { picture: _p, ...rest } = validAddMember()
        expect(ok(AddMemberSchema(rest))).toBe(false)
    })

    it("rejects a non-image picture", () => {
        expect(
            ok(AddMemberSchema(validAddMember({ picture: pdfFile("x.pdf") })))
        ).toBe(false)
    })

    it("accepts an empty string for optional social URLs", () => {
        expect(
            ok(
                AddMemberSchema(
                    validAddMember({ facebook: "", instagram: "", twitter: "" })
                )
            )
        ).toBe(true)
    })

    it("rejects a malformed social URL", () => {
        expect(
            ok(AddMemberSchema(validAddMember({ facebook: "not-a-url" })))
        ).toBe(false)
    })

    it("accepts a valid social URL", () => {
        expect(
            ok(
                AddMemberSchema(
                    validAddMember({ facebook: "https://facebook.com/lea" })
                )
            )
        ).toBe(true)
    })
})

describe("EditMemberSchema", () => {
    it("accepts a valid payload without a picture", () => {
        expect(ok(EditMemberSchema(validEditMember()))).toBe(true)
    })

    it("accepts a valid payload with a picture", () => {
        expect(
            ok(EditMemberSchema(validEditMember({ picture: imageFile() })))
        ).toBe(true)
    })

    it("rejects an invalid id", () => {
        expect(ok(EditMemberSchema(validEditMember({ id: 0 })))).toBe(false)
    })

    it("rejects a non-image picture", () => {
        expect(
            ok(EditMemberSchema(validEditMember({ picture: pdfFile("x.pdf") })))
        ).toBe(false)
    })
})
