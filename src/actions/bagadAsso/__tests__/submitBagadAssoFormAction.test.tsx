import type { ReactElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    bagadAssoTicketRecord,
    validBagadAssoForm
} from "@/test/factories/bagadAsso"
import {
    captchaModule,
    dbModule,
    emailModule,
    sentryModule,
    stdEnvModule
} from "@/test/mocks"

const stdenv = vi.hoisted(() => ({ isDevelopment: false }))
const h = vi.hoisted(() => ({
    create: vi.fn(),
    findEquipments: vi.fn(),
    sendEmail: vi.fn(),
    render: vi.fn(
        async (
            _node: ReactElement<{
                data: { equipments: { name: string; quantity: number }[] }
            }>
        ) => "<html></html>"
    ),
    verifyCaptcha: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("std-env", () => stdEnvModule(stdenv))
vi.mock("@/helpers/captcha/verify", () => captchaModule(h.verifyCaptcha))
vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoTicket: { create: h.create },
        bagadAssoEquipment: { findMany: h.findEquipments }
    })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => ({ render: h.render }))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { submitBagadAssoFormAction } from "../submitBagadAssoFormAction"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.create.mockResolvedValue(bagadAssoTicketRecord())
    h.findEquipments.mockResolvedValue([
        { id: 1, deposit: 50, name: "Barnum", imagePath: null }
    ])
    h.sendEmail.mockResolvedValue({ success: true })
})

describe("submitBagadAssoFormAction", () => {
    it("rejects an invalid payload before any side effect", async () => {
        const res = await submitBagadAssoFormAction(
            validBagadAssoForm({ associationEmail: "nope" })
        )
        if (res.success) throw new Error("expected failure")
        expect(res.error).toBe("Un ou plusieurs champs sont invalides.")
        expect(res.fieldErrors?.associationEmail).toBeDefined()
        expect(h.create).not.toHaveBeenCalled()
    })

    it("skips captcha verification in development", async () => {
        stdenv.isDevelopment = true
        const res = await submitBagadAssoFormAction(
            validBagadAssoForm({ captchaToken: "" })
        )
        expect(h.verifyCaptcha).not.toHaveBeenCalled()
        expect(res).toEqual({ success: true })
    })

    it("fails when the captcha is invalid", async () => {
        h.verifyCaptcha.mockResolvedValue(false)
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({
            success: false,
            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
        })
        expect(h.create).not.toHaveBeenCalled()
    })

    it("captures and fails when the db insert throws", async () => {
        h.create.mockRejectedValue(new Error("db down"))
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({
            success: false,
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("still succeeds when the notification emails fail (handled inside sendEmail)", async () => {
        h.sendEmail.mockResolvedValue({ success: false })
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("still succeeds and sends empty equipments when the name lookup throws", async () => {
        h.findEquipments.mockRejectedValue(new Error("db down"))
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({ success: true })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).toHaveBeenCalledTimes(2)
        expect(h.render.mock.calls[1]?.[0]?.props.data.equipments).toEqual([])
    })

    it("persists and notifies both the team and the association on the happy path", async () => {
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
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
        expect(h.sendEmail).toHaveBeenCalledTimes(2)
        expect(h.sendEmail).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                to: "evenement@fare-asso.fr",
                subject: "Nouveau ticket bagad'Asso #1"
            })
        )
        expect(h.sendEmail).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                to: ["asso@example.com", "lea@example.com"],
                subject: "Votre demande Bagad'Asso #1"
            })
        )
    })

    it("resolves equipment names from the db for the acknowledgement email", async () => {
        await submitBagadAssoFormAction(validBagadAssoForm())
        expect(h.findEquipments).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: { in: [1] } } })
        )
        expect(h.render.mock.calls[1]?.[0]?.props.data.equipments).toEqual([
            { name: "Barnum", quantity: 2 }
        ])
    })
})
