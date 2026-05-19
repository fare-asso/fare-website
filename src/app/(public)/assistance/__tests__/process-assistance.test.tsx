import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAssistanceForm } from "@/test/factories/assistance"
import { imageFile, pdfFile } from "@/test/factories/files"
import {
    captchaModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    stdEnvModule
} from "@/test/mocks"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const h = vi.hoisted(() => ({
    getAssistanceConfig: vi.fn(),
    sendEmail: vi.fn(),
    verifyCaptcha: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("std-env", () => stdEnvModule(stdenv))
vi.mock("@/helpers/assistanceConfig", () => ({
    getAssistanceConfig: h.getAssistanceConfig
}))
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("@/components/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { processAssistance } from "../process-assistance"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.getAssistanceConfig.mockResolvedValue({
        recipientEmail: "custom@fare-asso.fr",
        delay: "72h"
    })
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("processAssistance — validation & captcha", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await processAssistance(
            validAssistanceForm({ email: "nope" })
        )
        expect(res.success).toBe(false)
        expect(h.sendEmail).not.toHaveBeenCalled()
        expect(h.getAssistanceConfig).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await processAssistance(validAssistanceForm())
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res.success).toBe(true)
    })

    it("fails when the captcha is invalid in non-dev", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({
            success: false,
            error: "La vérification du captcha a échoué. Veuillez réessayer."
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})

describe("processAssistance — attachments", () => {
    it("rejects more than 3 files (schema-enforced)", async () => {
        const res = await processAssistance(
            validAssistanceForm({
                pieces: [pdfFile(), pdfFile(), pdfFile(), pdfFile()]
            })
        )
        expect(res.success).toBe(false)
        if (!res.success) {
            expect(res.error).toContain("3 fichiers")
        }
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("rejects a file larger than 2 Mo", async () => {
        const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.pdf", {
            type: "application/pdf"
        })
        const res = await processAssistance(
            validAssistanceForm({ pieces: [big] })
        )
        expect(res).toEqual({
            success: false,
            error: "Chaque fichier doit faire moins de 2 Mo."
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("attaches provided files to the internal email", async () => {
        await processAssistance(
            validAssistanceForm({
                pieces: [imageFile("photo.png"), pdfFile("preuve.pdf")]
            })
        )
        const internal = h.sendEmail.mock.calls[0][0]
        expect(internal.attachments).toHaveLength(2)
        expect(
            internal.attachments.map((a: { filename: string }) => a.filename)
        ).toEqual(["photo.png", "preuve.pdf"])
        expect(internal.attachments[0].content).toBeInstanceOf(Buffer)
    })
})

describe("processAssistance — happy path & emails", () => {
    it("sends the internal email to the configured recipient and acks the student", async () => {
        const res = await processAssistance(validAssistanceForm())

        expect(res).toEqual({ success: true })
        expect(h.sendEmail).toHaveBeenCalledTimes(2)

        const internal = h.sendEmail.mock.calls[0][0]
        const ack = h.sendEmail.mock.calls[1][0]
        expect(internal.to).toBe("custom@fare-asso.fr")
        expect(internal.subject).toContain("À l'université / mon établissement")
        expect(internal.subject).toContain("Marie Durand")
        expect(ack.to).toBe("marie.durand@etudiant.fr")
        expect(ack.attachments ?? []).toHaveLength(0)
    })

    it("still succeeds and captures when the acknowledgement email throws", async () => {
        h.sendEmail
            .mockResolvedValueOnce({ success: true })
            .mockRejectedValueOnce(new Error("smtp down"))
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({ success: true })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("fails when the internal email reports an error (handled, not captured)", async () => {
        h.sendEmail.mockResolvedValueOnce({
            success: false,
            error: "smtp down"
        })
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
        })
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("captures and fails when the internal email throws", async () => {
        h.sendEmail.mockRejectedValueOnce(new Error("smtp exploded"))
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
    })

    it("captures and fails when loading the config throws", async () => {
        h.getAssistanceConfig.mockRejectedValue(new Error("db down"))
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })
})
