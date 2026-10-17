import type { ReactElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    bagadAssoTicketWithEquipmentsRecord,
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
        bagadAssoTicket: { create: h.create }
    })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("react-email", () => ({ render: h.render }))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { submitBagadAssoFormAction } from "../submitBagadAssoFormAction"

beforeEach(() => {
    stdenv.isDevelopment = false
    h.verifyCaptcha.mockResolvedValue(true)
    h.create.mockResolvedValue(bagadAssoTicketWithEquipmentsRecord())
    h.render.mockResolvedValue("<html></html>")
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

    it.each([
        "not-json",
        '[{"id":1,"quantity":0}]',
        '[{"id":2147483648,"quantity":1}]',
        '[{"id":1,"quantity":2},{"id":1,"quantity":3}]'
    ])(
        "rejects invalid equipment before captcha and persistence: %s",
        async (equipment) => {
            const result = await submitBagadAssoFormAction(
                validBagadAssoForm({ equipment })
            )
            expect(result.success).toBe(false)
            if (!result.success)
                expect(result.fieldErrors?.equipment).toBeDefined()
            expect(h.verifyCaptcha).not.toHaveBeenCalled()
            expect(h.create).not.toHaveBeenCalled()
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it("rejects a missing production captcha before persistence", async () => {
        const result = await submitBagadAssoFormAction(
            validBagadAssoForm({ captchaToken: "" })
        )
        expect(result.success).toBe(false)
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

    it("still succeeds and attempts the other email when rendering fails", async () => {
        h.render.mockRejectedValueOnce(new Error("render failed"))
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({ success: true })
        expect(h.captureActionError).toHaveBeenCalledOnce()
        expect(h.sendEmail).toHaveBeenCalledTimes(1)
        expect(h.render).toHaveBeenCalledTimes(2)
    })

    it("persists and notifies both the team and the association on the happy path", async () => {
        const res = await submitBagadAssoFormAction(validBagadAssoForm())
        expect(res).toEqual({ success: true })
        expect(h.create).toHaveBeenCalledWith({
            data: {
                association: "Asso Test",
                associationEmail: "asso@example.com",
                firstName: "Lea",
                lastName: "Martin",
                position: "Presidente",
                phoneNumber: "0612345678",
                representativeEmail: "lea@example.com",
                eventName: "Gala annuel",
                eventType: "Soirée",
                eventAddr: "1 rue de la Paix, 35000 Rennes",
                estimatedParticipants: 120,
                eventDate: new Date("2026-09-01T00:00:00Z"),
                eventEndDate: new Date("2026-09-02T00:00:00Z"),
                equipmentMigratedAt: expect.any(Date),
                equipments: {
                    create: [
                        {
                            equipment: { connect: { id: 1 } },
                            requestedQuantity: 2,
                            allocatedQuantity: 2,
                            includedInContract: false
                        }
                    ]
                }
            },
            include: {
                equipments: {
                    orderBy: { equipmentId: "asc" },
                    include: { equipment: true }
                }
            }
        })
        expect(h.create.mock.calls[0]?.[0].data).not.toHaveProperty(
            "legacyEquipments"
        )
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

    it("creates multiple requested lines in one nested atomic insert", async () => {
        await submitBagadAssoFormAction(
            validBagadAssoForm({
                equipment: '[{"id":7,"quantity":3},{"id":2,"quantity":1}]'
            })
        )
        expect(h.create).toHaveBeenCalledOnce()
        expect(h.create.mock.calls[0]?.[0].data.equipments).toEqual({
            create: [
                {
                    equipment: { connect: { id: 7 } },
                    requestedQuantity: 3,
                    allocatedQuantity: 3,
                    includedInContract: false
                },
                {
                    equipment: { connect: { id: 2 } },
                    requestedQuantity: 1,
                    allocatedQuantity: 1,
                    includedInContract: false
                }
            ]
        })
    })

    it("uses relational names and requested quantities for the acknowledgement email", async () => {
        const ticket = bagadAssoTicketWithEquipmentsRecord()
        h.create.mockResolvedValue({
            ...ticket,
            equipments: ticket.equipments.map((line) => ({
                ...line,
                allocatedQuantity: 1,
                requestedQuantity: 2
            }))
        })
        await submitBagadAssoFormAction(validBagadAssoForm())
        expect(h.render.mock.calls[1]?.[0]?.props.data.equipments).toEqual([
            { name: "Barnum", quantity: 2 }
        ])
    })
})
