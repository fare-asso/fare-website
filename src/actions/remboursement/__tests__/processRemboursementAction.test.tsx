import { beforeEach, describe, expect, it, vi } from "vitest"

import { imageFile } from "@/test/factories/files"
import { validRemboursementForm } from "@/test/factories/remboursement"
import {
    captchaModule,
    dbModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    stdEnvModule,
    supabaseAstroModule
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
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({
        storage: { from }
    })
)
vi.mock("@/helpers/db", () => dbModule({ remboursement: { create: h.create } }))
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("@/helpers/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { processRemboursement } from "../processRemboursementAction"

const uuid = "11111111-1111-1111-1111-111111111111"
const folder = `marie-durand-${uuid}`

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

describe("processRemboursement — validation & captcha", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await processRemboursement(
            validRemboursementForm({ email: "nope" })
        )
        expect(res.success).toBe(false)
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
        expect(h.sendEmail).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("rejects a voiture request without passenger proof (narrow-enforced)", async () => {
        const res = await processRemboursement(
            validRemboursementForm({
                type: "voiture",
                personnes: "",
                justificatifsPassagers: []
            })
        )
        expect(res.success).toBe(false)
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await processRemboursement(validRemboursementForm())
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res.success).toBe(true)
    })

    it("fails when the captcha is invalid in non-dev", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await processRemboursement(validRemboursementForm())
        expect(res).toEqual({
            success: false,
            error: "La vérification du captcha a échoué. Veuillez réessayer."
        })
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})

describe("processRemboursement — storage & database", () => {
    it("uploads RIB and files to the remboursement bucket and persists all paths in db", async () => {
        const res = await processRemboursement(
            validRemboursementForm({
                type: "voiture",
                personnes: "Marie Durand (BDE Rennes)",
                piecesMetroBus: [imageFile("ticket.png")],
                justificatifsPassagers: [imageFile("groupe.png")]
            })
        )
        expect(res).toEqual({ success: true })
        expect(from).toHaveBeenCalledWith("remboursement")
        expect(h.create).toHaveBeenCalledWith({
            data: {
                demandeur: "adminFARE",
                association: "BDE Rennes",
                prenom: "Marie",
                nom: "Durand",
                email: "marie.durand@fare-asso.fr",
                telephone: "0612345678",
                type: "voiture",
                dateVoyage: new Date("2026-11-20T00:00:00.000Z"),
                depart: "Rennes",
                arrivee: "Paris",
                personnes: "Marie Durand (BDE Rennes)",
                objet: null,
                montantTTC: null,
                folderPath: folder,
                ribPath: `${folder}/rib.pdf`,
                justificatifsPaths: [`${folder}/justificatif-1.pdf`],
                piecesMetroBusPaths: [`${folder}/metro-bus-1.png`],
                justificatifsPassagersPaths: [`${folder}/passagers-1.png`]
            }
        })
    })

    it("cleans up already uploaded files when a later upload fails", async () => {
        h.upload.mockImplementation(async (path: string) =>
            path.endsWith("passagers-1.png")
                ? { data: null, error: { message: "boom" } }
                : { data: { path }, error: null }
        )
        const res = await processRemboursement(
            validRemboursementForm({
                type: "voiture",
                personnes: "Marie Durand (BDE Rennes)",
                piecesMetroBus: [imageFile("ticket.png")],
                justificatifsPassagers: [imageFile("groupe.png")]
            })
        )
        expect(res).toEqual({
            success: false,
            error: "Échec de l'envoi des fichiers. Veuillez réessayer plus tard."
        })
        expect(h.remove).toHaveBeenCalledWith([
            `${folder}/rib.pdf`,
            `${folder}/justificatif-1.pdf`,
            `${folder}/metro-bus-1.png`
        ])
        expect(h.create).not.toHaveBeenCalled()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("cleans up uploaded files and captures when the db insert throws", async () => {
        h.create.mockRejectedValueOnce(new Error("db down"))
        const res = await processRemboursement(validRemboursementForm())
        expect(res).toEqual({
            success: false,
            error: "Échec de l'enregistrement de la demande. Veuillez réessayer."
        })
        expect(h.remove).toHaveBeenCalledWith([
            `${folder}/rib.pdf`,
            `${folder}/justificatif-1.pdf`
        ])
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })
})

describe("processRemboursement — emails", () => {
    it("sends the notification email without attachments to trésorerie and acks the requester", async () => {
        const res = await processRemboursement(validRemboursementForm())

        expect(res).toEqual({ success: true })
        expect(h.verifyCaptcha).toHaveBeenCalledWith("token-123")
        expect(h.sendEmail).toHaveBeenCalledTimes(2)

        const internal = h.sendEmail.mock.calls[0][0]
        const ack = h.sendEmail.mock.calls[1][0]
        expect(internal.to).toBe("tresorerie@fare-asso.fr")
        expect(internal.replyTo).toBe("marie.durand@fare-asso.fr")
        expect(internal.subject).toBe("Demande de remboursement — Marie Durand")
        expect(internal.attachments).toBeUndefined()
        expect(ack.to).toBe("marie.durand@fare-asso.fr")
        expect(ack.subject).toBe(
            "Votre demande de remboursement a bien été reçue"
        )
    })

    it("clears association when the requester is Bureau Territorial", async () => {
        const res = await processRemboursement(
            validRemboursementForm({ demandeur: "bureauTerritorial" })
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    demandeur: "bureauTerritorial",
                    association: null
                })
            })
        )
    })

    it("still succeeds when sending emails fails (already persisted in db)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await processRemboursement(validRemboursementForm())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })
})
