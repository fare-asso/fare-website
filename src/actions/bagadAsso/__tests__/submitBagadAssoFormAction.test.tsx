import { beforeEach, describe, expect, it, vi } from "vitest"

import { validBagadAssoForm } from "@/test/factories/bagadAsso"
import {
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
    captureActionError: vi.fn()
}))

vi.mock("std-env", () => stdEnvModule(stdenv))
vi.mock("@/components/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoTicket: { create: h.create } })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import submitBagadAssoFormAction from "../submitBagadAssoFormAction"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.create.mockResolvedValue({ id: 1 })
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("submitBagadAssoFormAction", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm({ associationEmail: "nope" })
        )
        expect(res.error).toBe("Un ou plusieurs champs sont invalides.")
        expect(res.fieldErrors?.associationEmail).toBeDefined()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm({ captchaToken: "" })
        )
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res).toEqual({ success: true })
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm()
        )
        expect(res).toEqual({
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm()
        )
        expect(res).toEqual({
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("still succeeds when the notification email fails (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm()
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("persists, emails and revalidates on the happy path", async () => {
        const res = await submitBagadAssoFormAction(
            undefined,
            validBagadAssoForm()
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                association: "Asso Test",
                associationEmail: "asso@example.com",
                firstName: "Lea",
                lastName: "Martin",
                eventName: "Gala annuel"
            })
        })
        expect(h.sendEmail).toHaveBeenCalledOnce()
    })
})
