import { beforeEach, describe, expect, it, vi } from "vitest"

import { validContact } from "@/test/factories/contact"
import {
    captchaModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    stdEnvModule
} from "@/test/mocks"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const h = vi.hoisted(() => ({
    sendEmail: vi.fn(),
    verifyCaptcha: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("std-env", () => stdEnvModule(stdenv))
vi.mock("@/helpers/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { submitContactFormAction } from "../submitContactFormAction"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("submitContactFormAction", () => {
    it("rejects an invalid payload with field errors", async () => {
        const res = await submitContactFormAction(
            validContact({ email: "not-an-email", firstName: "" })
        )
        expect(res.error).toBe("Un ou plusieurs champs sont invalides.")
        expect(res.fieldErrors?.email).toBeDefined()
        expect(res.fieldErrors?.firstName).toBeDefined()
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(h.sendEmail).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await submitContactFormAction(
            validContact({ captchaToken: "" })
        )
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res).toEqual({ success: true })
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitContactFormAction(validContact())
        expect(res).toEqual({
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("returns an error when sending fails (sendEmail handles capture itself)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitContactFormAction(validContact())
        expect(res).toEqual({
            error: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
        })
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("sends the contact email and succeeds on the happy path", async () => {
        const res = await submitContactFormAction(validContact())
        expect(res).toEqual({ success: true })
        expect(h.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "contact@fare-asso.fr",
                subject: "Jean Dupont veut vous contacter"
            })
        )
    })
})
