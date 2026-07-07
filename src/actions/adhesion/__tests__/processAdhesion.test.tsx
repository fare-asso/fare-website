import { beforeEach, describe, expect, it, vi } from "vitest"

import { validAdhesionForm } from "@/test/factories/adhesion"
import { pdfFile } from "@/test/factories/files"
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
    upload: vi.fn(),
    remove: vi.fn(),
    create: vi.fn(),
    sendEmail: vi.fn(),
    verifyCaptcha: vi.fn(),
    captureActionError: vi.fn()
}))
const from = vi.hoisted(() =>
    vi.fn(() => ({ upload: h.upload, remove: h.remove }))
)

vi.mock("std-env", () => stdEnvModule(stdenv))
// createClient is sync under TanStack Start — the shared supabaseServerModule
// mock still returns a Promise, so mock it inline.
vi.mock("@/helpers/supabase.server", () => ({
    createClient: vi.fn(() => ({ storage: { from } }))
}))
vi.mock("@/helpers/db.server", () =>
    dbModule({ adhesion: { create: h.create } })
)
vi.mock("@/helpers/email.server", () => emailModule(h.sendEmail))
vi.mock("@/components/captcha/verify.server", () =>
    captchaModule(h.verifyCaptcha)
)
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => ({
    ...sentryModule(h.captureActionError),
    // pack/unpack are passthroughs here — the serverFn mock keeps args local.
    packActionArgs: async <A extends unknown[]>(args: A): Promise<A> => args,
    unpackActionArgs: <A extends unknown[]>(data: A): A => data
}))

import { processAdhesion } from "../processAdhesion"

const uuid = "11111111-1111-1111-1111-111111111111"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.upload.mockImplementation(async (path: string) => ({
        data: { path },
        error: null
    }))
    h.remove.mockResolvedValue({ data: null, error: null })
    h.create.mockResolvedValue({ id: 1 })
    h.sendEmail.mockResolvedValue({ success: true })
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
        uuid as ReturnType<typeof crypto.randomUUID>
    )
})

describe("processAdhesion", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await processAdhesion(validAdhesionForm({ sigle: "F" }))
        expect(res.success).toBe(false)
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await processAdhesion(validAdhesionForm())
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res.success).toBe(true)
    })

    it("fails when the captcha is invalid in non-dev", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await processAdhesion(validAdhesionForm())
        expect(res).toEqual({
            success: false,
            message: "La vérification du captcha a échoué. Veuillez réessayer."
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("cleans up uploaded files when a required upload fails", async () => {
        h.upload.mockImplementation(async (path: string) =>
            path.endsWith("statuts.pdf")
                ? { data: null, error: { message: "boom" } }
                : { data: { path }, error: null }
        )
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(false)
        expect(h.remove).toHaveBeenCalledWith([
            `${uuid}-fare/logo.png`,
            `${uuid}-fare/recepisse.pdf`,
            `${uuid}-fare/extraitPV.pdf`
        ])
        expect(h.create).not.toHaveBeenCalled()
    })

    it("cleans up and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(false)
        expect(h.remove).toHaveBeenCalledWith([
            `${uuid}-fare/logo.png`,
            `${uuid}-fare/statuts.pdf`,
            `${uuid}-fare/recepisse.pdf`,
            `${uuid}-fare/extraitPV.pdf`
        ])
        expect(h.captureActionError).toHaveBeenCalled()
    })

    it("still succeeds when sending emails fails (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await processAdhesion(validAdhesionForm())
        expect(res.success).toBe(true)
        expect(h.create).toHaveBeenCalledOnce()
    })

    it("uploads only the optional documents that are provided", async () => {
        await processAdhesion(
            validAdhesionForm({ lettreEngagement: pdfFile("l.pdf") })
        )
        const uploaded = h.upload.mock.calls.map((c) => c[0])
        expect(uploaded).toContain(`${uuid}-fare/lettreEngagement.pdf`)
        expect(uploaded).not.toContain(`${uuid}-fare/reglementInterieur.pdf`)
        expect(uploaded).not.toContain(`${uuid}-fare/bilanFinancier.pdf`)
    })

    it("persists and emails on the happy path", async () => {
        const res = await processAdhesion(validAdhesionForm())

        expect(res).toEqual({ success: true })
        expect(from).toHaveBeenCalledWith("adhesion")
        expect(h.create).toHaveBeenCalledWith({
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

        const subjects = h.sendEmail.mock.calls.map((c) => c[0].subject)
        const recipients = h.sendEmail.mock.calls.map((c) => c[0].to)
        expect(h.sendEmail).toHaveBeenCalledTimes(2)
        expect(subjects).toContain("Nouvelle demande d'adhésion - FARE")
        expect(subjects).toContain("Demande d'adhésion reçue")
        expect(recipients).toContain("secretariat@fare-asso.fr")
        expect(recipients).toContain("contact@asso.fr")
    })
})
