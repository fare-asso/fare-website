import { beforeEach, describe, expect, it, vi } from "vitest"

import { validSuggestionInput } from "@/test/factories/bagadAsso"
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
vi.mock("@/helpers/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/db", () =>
    dbModule({ bagadAssoSuggestion: { create: h.create } })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { submitSuggestionAction } from "../submitSuggestionAction"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.create.mockResolvedValue({ id: 1 })
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("submitSuggestionAction", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await submitSuggestionAction(
            validSuggestionInput({ contactEmail: "nope" })
        )
        expect(res).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await submitSuggestionAction(
            validSuggestionInput({ captchaToken: "" })
        )
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res).toEqual({ success: true })
    })

    it("requires a captcha token in production", async () => {
        const res = await submitSuggestionAction(
            validSuggestionInput({ captchaToken: "" })
        )
        expect(res).toEqual({
            success: false,
            error: "Veuillez compléter le CAPTCHA."
        })
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitSuggestionAction(validSuggestionInput())
        expect(res).toEqual({
            success: false,
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await submitSuggestionAction(validSuggestionInput())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'envoi de la suggestion. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("still succeeds when the notification email fails (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitSuggestionAction(validSuggestionInput())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("persists the suggestion and notifies the team on the happy path", async () => {
        const res = await submitSuggestionAction(
            validSuggestionInput({ details: "Pour nos galas" })
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: {
                equipmentName: "Vidéoprojecteur",
                equipmentType: "electronique",
                referenceUrl: null,
                associationName: "Asso Test",
                firstName: "Lea",
                lastName: "Martin",
                position: "Presidente",
                contactEmail: "lea@example.com",
                details: "Pour nos galas"
            }
        })
        expect(h.sendEmail).toHaveBeenCalledOnce()
        expect(h.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "evenement@fare-asso.fr",
                subject: "Nouvelle suggestion de matériel Bagad'Asso #1"
            })
        )
    })

    it("stores a provided reference url", async () => {
        await submitSuggestionAction(
            validSuggestionInput({ referenceUrl: "https://example.com/p" })
        )
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                referenceUrl: "https://example.com/p"
            })
        })
    })
})
