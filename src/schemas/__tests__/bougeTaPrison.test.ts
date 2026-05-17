import { describe, expect, it } from "vitest"
import { pdfFile } from "@/test/factories/files"
import {
    BTPTutorApplicationSchema,
    BTPTutorQuestionSchema
} from "../bougeTaPrison"

const validApplication = () => ({
    firstName: "Lea",
    lastName: "Martin",
    email: "lea@example.com",
    major: "Droit",
    studyYear: "M1",
    cv: pdfFile("cv.pdf"),
    motivationLetter: pdfFile("lm.pdf"),
    captchaToken: "token-123"
})

const validQuestion = () => ({
    firstName: "Lea",
    lastName: "Martin",
    email: "lea@example.com",
    major: "Droit",
    studyYear: "M1",
    message: "Comment devenir tuteur ?",
    captchaToken: "token-123"
})

describe("BTPTutorApplicationSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(
            BTPTutorApplicationSchema.safeParse(validApplication()).success
        ).toBe(true)
    })

    it("rejects a study year outside L3 | M1 | M2", () => {
        const res = BTPTutorApplicationSchema.safeParse({
            ...validApplication(),
            studyYear: "L2"
        })
        expect(res.success).toBe(false)
    })

    it("rejects a non-PDF CV", () => {
        const res = BTPTutorApplicationSchema.safeParse({
            ...validApplication(),
            cv: new File([new Uint8Array([1])], "cv.png", {
                type: "image/png"
            })
        })
        expect(res.success).toBe(false)
    })

    it("rejects a CV larger than 5 MB", () => {
        const big = new File([new Uint8Array(6 * 1024 * 1024)], "cv.pdf", {
            type: "application/pdf"
        })
        const res = BTPTutorApplicationSchema.safeParse({
            ...validApplication(),
            cv: big
        })
        expect(res.success).toBe(false)
    })
})

describe("BTPTutorQuestionSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(BTPTutorQuestionSchema.safeParse(validQuestion()).success).toBe(
            true
        )
    })

    it("rejects an invalid email", () => {
        const res = BTPTutorQuestionSchema.safeParse({
            ...validQuestion(),
            email: "not-an-email"
        })
        expect(res.success).toBe(false)
    })

    it("rejects a message longer than 1000 characters", () => {
        const res = BTPTutorQuestionSchema.safeParse({
            ...validQuestion(),
            message: "x".repeat(1001)
        })
        expect(res.success).toBe(false)
    })

    it("accepts the 'other' study year option", () => {
        const res = BTPTutorQuestionSchema.safeParse({
            ...validQuestion(),
            studyYear: "other"
        })
        expect(res.success).toBe(true)
    })
})
