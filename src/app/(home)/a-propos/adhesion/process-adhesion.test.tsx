import { beforeEach, describe, expect, it, vi } from "vitest"
import { pdfFile, validAdhesionForm } from "@/test/factories"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const sb = vi.hoisted(() => {
    const upload = vi.fn()
    const remove = vi.fn()
    const from = vi.fn(() => ({ upload, remove }))
    return { upload, remove, from }
})
const db = vi.hoisted(() => ({ create: vi.fn() }))
const mail = vi.hoisted(() => ({ sendEmail: vi.fn() }))
const cap = vi.hoisted(() => ({ verifyCaptcha: vi.fn() }))
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }))

vi.mock("std-env", () => ({
    get isDevelopment() {
        return stdenv.isDevelopment
    }
}))
vi.mock("@/helpers/supabase/server", () => ({
    createClient: vi.fn(async () => ({ storage: { from: sb.from } }))
}))
vi.mock("@/helpers/db", () => ({
    default: { adhesion: { create: db.create } }
}))
vi.mock("@/helpers/email", () => ({ sendEmail: mail.sendEmail }))
vi.mock("@/components/captcha/verify", () => ({
    verifyCaptcha: cap.verifyCaptcha
}))
vi.mock("next/cache", () => ({ revalidatePath: cache.revalidatePath }))
vi.mock("@react-email/render", () => ({
    render: vi.fn(async () => "<html></html>")
}))

import { processAdhesion } from "./process-adhesion"

const uuid = "11111111-1111-1111-1111-111111111111"

beforeEach(() => {
    stdenv.isDevelopment = false
    cap.verifyCaptcha.mockResolvedValue(true)
    sb.upload.mockImplementation(async (path: string) => ({
        data: { path },
        error: null
    }))
    sb.remove.mockResolvedValue({ data: null, error: null })
    db.create.mockResolvedValue({ id: 1 })
    mail.sendEmail.mockResolvedValue({ success: true })
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
        uuid as ReturnType<typeof crypto.randomUUID>
    )
})

describe("processAdhesion", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await processAdhesion(validAdhesionForm({ sigle: "F" }))
        expect(res.success).toBe(false)
        expect(sb.upload).not.toHaveBeenCalled()
        expect(db.create).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await processAdhesion(validAdhesionForm())
        expect(cap.verifyCaptcha).not.toHaveBeenCalled()
        expect(res.success).toBe(true)
    })

    it("fails when the captcha is invalid in non-dev", async () => {
        cap.verifyCaptcha.mockResolvedValue(false)
        const res = await processAdhesion(validAdhesionForm())
        expect(res).toEqual({
            success: false,
            message: "La vérification du captcha a échoué. Veuillez réessayer."
        })
        expect(sb.upload).not.toHaveBeenCalled()
        expect(db.create).not.toHaveBeenCalled()
    })

    it("cleans up uploaded files when a required upload fails", async () => {
        sb.upload.mockImplementation(async (path: string) =>
            path.endsWith("statuts.pdf")
                ? { data: null, error: { message: "boom" } }
                : { data: { path }, error: null }
        )
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(false)
        expect(sb.remove).toHaveBeenCalledWith([
            `${uuid}-fare/logo.png`,
            `${uuid}-fare/recepisse.pdf`,
            `${uuid}-fare/extraitPV.pdf`
        ])
        expect(db.create).not.toHaveBeenCalled()
    })

    it("cleans up and fails when the db insert throws", async () => {
        db.create.mockRejectedValue(new Error("db down"))
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(false)
        expect(sb.remove).toHaveBeenCalledWith([
            `${uuid}-fare/logo.png`,
            `${uuid}-fare/statuts.pdf`,
            `${uuid}-fare/recepisse.pdf`,
            `${uuid}-fare/extraitPV.pdf`
        ])
    })

    it("still succeeds when sending emails fails", async () => {
        mail.sendEmail.mockRejectedValue(new Error("smtp down"))
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(true)
        expect(db.create).toHaveBeenCalledOnce()
    })

    it("uploads only the optional documents that are provided", async () => {
        await processAdhesion(
            validAdhesionForm({ lettreEngagement: pdfFile("l.pdf") })
        )
        const uploaded = sb.upload.mock.calls.map((c) => c[0])
        expect(uploaded).toContain(`${uuid}-fare/lettreEngagement.pdf`)
        expect(uploaded).not.toContain(`${uuid}-fare/reglementInterieur.pdf`)
        expect(uploaded).not.toContain(`${uuid}-fare/bilanFinancier.pdf`)
    })

    it("persists, emails and revalidates on the happy path", async () => {
        const res = await processAdhesion(validAdhesionForm())

        expect(res).toEqual({ success: true })
        expect(sb.from).toHaveBeenCalledWith("adhesion")
        expect(db.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                association: "Federation des Associations",
                nomComplet: "Federation des Associations",
                sigle: "FARE",
                email: "contact@asso.fr",
                telephonePortable: "0612345678",
                telephoneFixe: null,
                college: "A",
                filiere: "Informatique",
                siegeSocial: "",
                numeroSalle: "",
                engagementCotisation: true,
                folderPath: `${uuid}-fare`,
                logoPath: `${uuid}-fare/logo.png`,
                statutsPath: `${uuid}-fare/statuts.pdf`,
                recepissePath: `${uuid}-fare/recepisse.pdf`,
                extraitPVPath: `${uuid}-fare/extraitPV.pdf`,
                lettreEngagementPath: null,
                reglementInterieurPath: null,
                bilanFinancierPath: null
            })
        })

        const subjects = mail.sendEmail.mock.calls.map((c) => c[0].subject)
        const recipients = mail.sendEmail.mock.calls.map((c) => c[0].to)
        expect(mail.sendEmail).toHaveBeenCalledTimes(2)
        expect(subjects).toContain("Nouvelle demande d'adhésion - FARE")
        expect(subjects).toContain("Demande d'adhésion reçue")
        expect(recipients).toContain("secretariat@fare-asso.fr")
        expect(recipients).toContain("contact@asso.fr")
        expect(cache.revalidatePath).toHaveBeenCalledWith(
            "/dashboard/adhesions"
        )
    })
})
