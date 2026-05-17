import type { BTPTutorApplication } from "@prisma/client"
import type { BTPTutorQuestion } from "@/schemas/bougeTaPrison"
import { pdfFile } from "./files"

export function validTutorApplicationRecord(
    overrides: Partial<BTPTutorApplication> = {}
): BTPTutorApplication {
    return {
        id: 1,
        createdAt: new Date("2026-02-01T00:00:00Z"),
        firstName: "Lea",
        lastName: "Martin",
        email: "lea@example.com",
        major: "Droit",
        studyYear: "M1",
        mlPath: "folder/lm.pdf",
        cvPath: "folder/cv.pdf",
        approved: false,
        archived: null,
        ...overrides
    }
}

export function validTutorQuestion(
    overrides: Partial<BTPTutorQuestion> = {}
): BTPTutorQuestion {
    return {
        firstName: "Lea",
        lastName: "Martin",
        email: "lea@example.com",
        major: "Droit",
        studyYear: "M1",
        message: "Comment devenir tuteur ?",
        captchaToken: "token-123",
        ...overrides
    }
}

export function validTutorApplicationFormData(
    overrides: Record<string, string | File> = {}
): FormData {
    const fd = new FormData()
    fd.set("firstName", "Lea")
    fd.set("lastName", "Martin")
    fd.set("email", "lea@example.com")
    fd.set("major", "Droit")
    fd.set("studyYear", "M1")
    fd.set("cv", pdfFile("cv.pdf"))
    fd.set("motivationLetter", pdfFile("lm.pdf"))
    fd.set("captchaToken", "token-123")
    for (const [key, value] of Object.entries(overrides)) {
        fd.set(key, value)
    }
    return fd
}
