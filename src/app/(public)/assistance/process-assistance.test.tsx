import { beforeEach, describe, expect, it, vi } from "vitest"
import { validAssistanceForm } from "@/test/factories/assistance"
import { imageFile, pdfFile } from "@/test/factories/files"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const cfg = vi.hoisted(() => ({ getAssistanceConfig: vi.fn() }))
const mail = vi.hoisted(() => ({ sendEmail: vi.fn() }))
const cap = vi.hoisted(() => ({ verifyCaptcha: vi.fn() }))

vi.mock("std-env", () => ({
    get isDevelopment() {
        return stdenv.isDevelopment
    }
}))
vi.mock("@/helpers/assistanceConfig", () => ({
    getAssistanceConfig: cfg.getAssistanceConfig
}))
vi.mock("@/helpers/email", () => ({ sendEmail: mail.sendEmail }))
vi.mock("@/components/captcha/verify", () => ({
    verifyCaptcha: cap.verifyCaptcha
}))
vi.mock("@react-email/render", () => ({
    render: vi.fn(async () => "<html></html>")
}))

import { processAssistance } from "./process-assistance"

beforeEach(() => {
    stdenv.isDevelopment = false
    cap.verifyCaptcha.mockResolvedValue(true)
    cfg.getAssistanceConfig.mockResolvedValue({
        recipientEmail: "custom@fare-asso.fr",
        delay: "72h"
    })
    mail.sendEmail.mockResolvedValue({ success: true })
})

describe("processAssistance — validation & captcha", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await processAssistance(
            validAssistanceForm({ email: "nope" })
        )
        expect(res.success).toBe(false)
        expect(mail.sendEmail).not.toHaveBeenCalled()
        expect(cfg.getAssistanceConfig).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await processAssistance(validAssistanceForm())
        expect(cap.verifyCaptcha).not.toHaveBeenCalled()
        expect(res.success).toBe(true)
    })

    it("fails when the captcha is invalid in non-dev", async () => {
        cap.verifyCaptcha.mockResolvedValue(false)
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({
            success: false,
            message: "La vérification du captcha a échoué. Veuillez réessayer."
        })
        expect(mail.sendEmail).not.toHaveBeenCalled()
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
            expect(res.message).toContain("3 fichiers")
        }
        expect(mail.sendEmail).not.toHaveBeenCalled()
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
            message: "Chaque fichier doit faire moins de 2 Mo."
        })
        expect(mail.sendEmail).not.toHaveBeenCalled()
    })

    it("attaches provided files to the internal email", async () => {
        await processAssistance(
            validAssistanceForm({
                pieces: [imageFile("photo.png"), pdfFile("preuve.pdf")]
            })
        )
        const internal = mail.sendEmail.mock.calls[0][0]
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
        expect(mail.sendEmail).toHaveBeenCalledTimes(2)

        const internal = mail.sendEmail.mock.calls[0][0]
        const ack = mail.sendEmail.mock.calls[1][0]
        expect(internal.to).toBe("custom@fare-asso.fr")
        expect(internal.subject).toContain("À l'université / mon établissement")
        expect(internal.subject).toContain("Marie Durand")
        expect(ack.to).toBe("marie.durand@etudiant.fr")
        expect(ack.attachments ?? []).toHaveLength(0)
    })

    it("still succeeds when the acknowledgement email throws", async () => {
        mail.sendEmail
            .mockResolvedValueOnce({ success: true })
            .mockRejectedValueOnce(new Error("smtp down"))
        const res = await processAssistance(validAssistanceForm())
        expect(res).toEqual({ success: true })
    })

    it("fails when the internal email cannot be sent", async () => {
        mail.sendEmail.mockResolvedValueOnce({
            success: false,
            error: "smtp down"
        })
        const res = await processAssistance(validAssistanceForm())
        expect(res.success).toBe(false)
    })
})
