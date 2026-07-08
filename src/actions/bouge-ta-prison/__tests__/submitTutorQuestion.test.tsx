import { beforeEach, describe, expect, it, vi } from "vitest"

import { validTutorQuestion } from "@/test/factories/bougeTaPrison"
import {
    cacheModule,
    captchaModule,
    dbModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    stdEnvModule
} from "@/test/mocks"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const h = vi.hoisted(() => ({
    create: vi.fn(),
    sendEmail: vi.fn(),
    verifyCaptcha: vi.fn(),
    revalidatePath: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("std-env", () => stdEnvModule(stdenv))
vi.mock("@/helpers/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorQuestion: { create: h.create } })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("next/cache", () => cacheModule(h.revalidatePath))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import submitTutorQuestion from "../submitTutorQuestion"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.create.mockResolvedValue({ id: 1 })
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("submitTutorQuestion", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await submitTutorQuestion(
            validTutorQuestion({ email: "nope" })
        )
        expect(res.error).toBe("Un ou plusieurs champs sont invalides.")
        expect(res.fieldErrors?.email).toBeDefined()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitTutorQuestion(validTutorQuestion())
        expect(res).toEqual({
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await submitTutorQuestion(validTutorQuestion())
        expect(res).toEqual({
            error: "Echec de l'enregistrement de la question. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("still succeeds when the notification email fails (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitTutorQuestion(validTutorQuestion())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("persists, emails and revalidates on the happy path", async () => {
        const res = await submitTutorQuestion(validTutorQuestion())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                email: "lea@example.com",
                major: "Droit",
                studyYear: "M1",
                question: "Comment devenir tuteur ?"
            })
        })
        expect(h.sendEmail).toHaveBeenCalledOnce()
        expect(h.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/bouge-ta-prison"
        )
    })
})
