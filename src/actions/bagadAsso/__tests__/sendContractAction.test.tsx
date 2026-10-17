import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    bagadAssoEquipmentRecord,
    bagadAssoTicketRecord
} from "@/test/factories/bagadAsso"
import { mockUser } from "@/test/factories/user"
import {
    dbModule,
    emailModule,
    sentryModule,
    supabaseAstroModule
} from "@/test/mocks"

const h = vi.hoisted(() => ({
    getUser: vi.fn(),
    findTicket: vi.fn(),
    findEquipments: vi.fn(),
    update: vi.fn(),
    sendEmail: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoTicket: { findUnique: h.findTicket, update: h.update },
        bagadAssoEquipment: { findMany: h.findEquipments }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { sendContractAction } from "../sendContractAction"

const input = { ticketId: 1, equipmentIds: [1] }

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.findTicket.mockResolvedValue(bagadAssoTicketRecord())
    h.findEquipments.mockResolvedValue([bagadAssoEquipmentRecord()])
    h.sendEmail.mockResolvedValue({ success: true })
    h.update.mockResolvedValue({ id: 1 })
})

describe("sendContractAction", () => {
    it("requires authentication and the edit permission", async () => {
        h.getUser.mockResolvedValueOnce(null)
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        h.getUser.mockResolvedValueOnce(mockUser([]))
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: expect.stringMatching(/permission/)
        })
        expect(h.findTicket).not.toHaveBeenCalled()
    })

    it("rejects invalid ids and duplicates before querying", async () => {
        const results = await Promise.all(
            [
                { ticketId: -1, equipmentIds: [1] },
                { ticketId: 1, equipmentIds: [-1] },
                { ticketId: 1, equipmentIds: [1, 1] }
            ].map((value) => sendContractAction(value))
        )
        for (const result of results) {
            expect(result).toEqual({
                success: false,
                error: "Un ou plusieurs champs sont invalides."
            })
        }
        expect(h.findTicket).not.toHaveBeenCalled()
    })

    it("reports ticket lookup failures and rejects missing or closed tickets", async () => {
        h.findTicket.mockRejectedValueOnce(new Error("db down"))
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Echec de la récupération du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()

        h.findTicket.mockResolvedValueOnce(null)
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Ce ticket ne peut pas recevoir de contrat"
        })
        h.findTicket.mockResolvedValueOnce(
            bagadAssoTicketRecord({ deleted: new Date() })
        )
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Ce ticket ne peut pas recevoir de contrat"
        })
        h.findTicket.mockResolvedValueOnce(
            bagadAssoTicketRecord({ validated: new Date() })
        )
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Ce ticket ne peut pas recevoir de contrat"
        })
        expect(h.findEquipments).not.toHaveBeenCalled()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("rejects corrupted ticket equipment and ids not on the ticket", async () => {
        h.findTicket.mockResolvedValueOnce(
            bagadAssoTicketRecord({ equipments: "not json" })
        )
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Matériel du ticket invalide"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()

        h.findTicket.mockResolvedValueOnce(
            bagadAssoTicketRecord({ equipments: "[]" })
        )
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Matériel sélectionné invalide"
        })
        expect(h.findEquipments).not.toHaveBeenCalled()
    })

    it("does not send if equipment lookup fails or equipment is missing", async () => {
        h.findEquipments.mockRejectedValueOnce(new Error("db down"))
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Echec de la récupération du matériel"
        })
        expect(h.captureActionError).toHaveBeenCalledOnce()

        h.findEquipments.mockResolvedValueOnce([])
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Matériel sélectionné introuvable"
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("loads server-side details but never sends the unfinished PDF", async () => {
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Le contrat PDF n'est pas encore disponible"
        })
        expect(h.findTicket).toHaveBeenCalledWith({ where: { id: 1 } })
        expect(h.findEquipments).toHaveBeenCalledWith({
            where: { id: { in: [1] } },
            select: { id: true, name: true, deposit: true }
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
        expect(h.update).not.toHaveBeenCalled()
    })
})
