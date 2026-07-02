import { type } from "arktype"
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
            BTPTutorApplicationSchema(validApplication())
        ).not.toBeInstanceOf(type.errors)
    })

    it("rejects a study year outside L3 | M1 | M2", () => {
        const res = BTPTutorApplicationSchema({
            ...validApplication(),
            studyYear: "L2"
        })
        expect(res).toBeInstanceOf(type.errors)
    })

    it("rejects a non-PDF CV", () => {
        const res = BTPTutorApplicationSchema({
            ...validApplication(),
            cv: new File([new Uint8Array([1])], "cv.png", {
                type: "image/png"
            })
        })
        expect(res).toBeInstanceOf(type.errors)
    })

    it("rejects a CV larger than 5 MB", () => {
        const big = new File([new Uint8Array(6 * 1024 * 1024)], "cv.pdf", {
            type: "application/pdf"
        })
        const res = BTPTutorApplicationSchema({
            ...validApplication(),
            cv: big
        })
        expect(res).toBeInstanceOf(type.errors)
    })
})

describe("BTPTutorQuestionSchema", () => {
    it("accepts a fully valid payload", () => {
        expect(BTPTutorQuestionSchema(validQuestion())).not.toBeInstanceOf(
            type.errors
        )
    })

    it("rejects an invalid email", () => {
        const res = BTPTutorQuestionSchema({
            ...validQuestion(),
            email: "not-an-email"
        })
        expect(res).toBeInstanceOf(type.errors)
    })

    it("rejects a message longer than 1000 characters", () => {
        const res = BTPTutorQuestionSchema({
            ...validQuestion(),
            message: "x".repeat(1001)
        })
        expect(res).toBeInstanceOf(type.errors)
    })

    it("accepts the 'other' study year option", () => {
        const res = BTPTutorQuestionSchema({
            ...validQuestion(),
            studyYear: "other"
        })
        expect(res).not.toBeInstanceOf(type.errors)
    })
})
