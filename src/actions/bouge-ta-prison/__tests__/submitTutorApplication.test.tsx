import { beforeEach, describe, expect, it, vi } from "vitest"

import { validTutorApplicationFormData } from "@/test/factories/bougeTaPrison"
import {
    captchaModule,
    dbModule,
    emailModule,
    reactEmailRenderModule,
    sentryModule,
    stdEnvModule,
    supabaseServerModule
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
vi.mock("@/components/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/supabase/server", () =>
    supabaseServerModule({ storage: { from } })
)
vi.mock("@/helpers/db", () =>
    dbModule({ bTPTutorApplication: { create: h.create } })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => reactEmailRenderModule())
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import submitTutorApplication from "../submitTutorApplication"

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
})

describe("submitTutorApplication", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await submitTutorApplication(
            validTutorApplicationFormData({ studyYear: "X" })
        )
        expect(res.error).toBe("Un ou plusieurs champs sont invalides.")
        expect(res.fieldErrors?.studyYear).toBeDefined()
        expect(h.upload).not.toHaveBeenCalled()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.upload).not.toHaveBeenCalled()
    })

    it("errors when the CV upload fails", async () => {
        h.upload.mockImplementationOnce(async () => ({
            data: null,
            error: { message: "boom" }
        }))
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({ error: "Echec de l'upload du CV" })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("cleans up the CV when the motivation letter upload fails", async () => {
        h.upload
            .mockImplementationOnce(async (path: string) => ({
                data: { path },
                error: null
            }))
            .mockImplementationOnce(async () => ({
                data: null,
                error: { message: "boom" }
            }))
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({
            error: "Echec de l'upload de la lettre de motivation"
        })
        expect(h.remove).toHaveBeenCalledOnce()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures, cleans up and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({
            error: "Echec de la création de la candidature. Veuillez réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalled()
        expect(h.remove).toHaveBeenCalledOnce()
        const removed = h.remove.mock.calls[0][0]
        expect(removed).toHaveLength(2)
    })

    it("still succeeds when the notification email fails (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("persists, emails and revalidates on the happy path", async () => {
        const res = await submitTutorApplication(
            validTutorApplicationFormData()
        )
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                firstName: "Lea",
                lastName: "Martin",
                email: "lea@example.com",
                major: "Droit",
                studyYear: "M1"
            })
        })
        expect(h.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "intervention-carceral@fare-asso.fr",
                subject: "Nouvelle candidature de tuteur Bouge Ta Prison"
            })
        )
    })
})
