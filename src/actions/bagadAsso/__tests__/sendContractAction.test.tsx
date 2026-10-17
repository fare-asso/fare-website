import { beforeEach, describe, expect, it, vi } from "vitest"

import { ticketEquipmentInclude } from "@/helpers/bagadAsso/ticketEquipment"
import type { ActionResult } from "@/lib/action"
import {
    bagadAssoEquipmentRecord,
    bagadAssoTicketEquipmentRecord,
    bagadAssoTicketWithEquipmentsRecord
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
    claim: vi.fn(),
    updateLines: vi.fn(),
    transaction: vi.fn(),
    sendEmail: vi.fn(),
    generatePdf: vi.fn(),
    capture: vi.fn()
}))
vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoTicket: { findUnique: h.findTicket },
        $transaction: h.transaction
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/helpers/email", () => emailModule(h.sendEmail))
vi.mock("@/helpers/bagadAsso/generateContractPdf", () => ({
    generateContractPdf: h.generatePdf
}))
vi.mock("@/lib/sentry", () => sentryModule(h.capture))

import { sendContractAction } from "../sendContractAction"

const input = { ticketId: 1, equipmentIds: [1] }
const tx = {
    bagadAssoTicket: { updateMany: h.claim },
    bagadAssoTicketEquipment: { updateMany: h.updateLines }
}

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.findTicket.mockResolvedValue(bagadAssoTicketWithEquipmentsRecord())
    h.claim.mockResolvedValue({ count: 1 })
    h.updateLines.mockResolvedValue({ count: 1 })
    h.transaction.mockImplementation(
        (run: (client: typeof tx) => Promise<ActionResult>) => run(tx)
    )
    h.sendEmail.mockResolvedValue({ success: true })
    h.generatePdf.mockResolvedValue(Buffer.from("%PDF-1.7"))
})

describe("sendContractAction", () => {
    it("requires authentication and permission", async () => {
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

    it.each([
        { ticketId: -1, equipmentIds: [1] },
        { ticketId: 1, equipmentIds: [-1] },
        { ticketId: 1, equipmentIds: [] },
        { ticketId: 1, equipmentIds: [1, 1] },
        { ticketId: 2147483648, equipmentIds: [1] },
        { ticketId: 1, equipmentIds: [2147483648] },
        { ...input, includeCommunication: "non" as never }
    ])("rejects invalid payloads: %j", async (value) => {
        expect(await sendContractAction(value)).toEqual({
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        })
        expect(h.findTicket).not.toHaveBeenCalled()
    })

    it("captures ticket lookup failures", async () => {
        h.findTicket.mockRejectedValueOnce(new Error("db down"))
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Echec de la récupération du ticket"
        })
        expect(h.capture).toHaveBeenCalledOnce()
    })

    it.each([
        null,
        bagadAssoTicketWithEquipmentsRecord({ deleted: new Date() }),
        bagadAssoTicketWithEquipmentsRecord({ validated: new Date() })
    ])("rejects missing or closed tickets", async (ticket) => {
        h.findTicket.mockResolvedValueOnce(ticket)
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Ce ticket ne peut pas recevoir de contrat"
        })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("rejects soft-deleted equipment in a new contract", async () => {
        const ticket = bagadAssoTicketWithEquipmentsRecord()
        ticket.equipments[0].equipment.deletedAt = new Date()
        h.findTicket.mockResolvedValueOnce(ticket)
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Matériel sélectionné invalide"
        })
        expect(h.generatePdf).not.toHaveBeenCalled()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("rejects equipment absent from the ticket", async () => {
        expect(
            await sendContractAction({ ...input, equipmentIds: [99] })
        ).toEqual({ success: false, error: "Matériel sélectionné invalide" })
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("uses allocated quantities and persists the final selection atomically", async () => {
        h.findTicket.mockResolvedValueOnce(
            bagadAssoTicketWithEquipmentsRecord({
                equipments: [
                    {
                        ...bagadAssoTicketEquipmentRecord({
                            requestedQuantity: 3,
                            allocatedQuantity: 1
                        }),
                        equipment: bagadAssoEquipmentRecord()
                    },
                    {
                        ...bagadAssoTicketEquipmentRecord({
                            equipmentId: 2,
                            includedInContract: true
                        }),
                        equipment: bagadAssoEquipmentRecord({ id: 2 })
                    }
                ]
            })
        )
        expect(await sendContractAction(input)).toEqual({ success: true })
        expect(h.findTicket).toHaveBeenCalledWith({
            where: { id: 1 },
            include: ticketEquipmentInclude
        })
        expect(h.generatePdf).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            [{ id: 1, name: "Barnum", deposit: 50, quantity: 1 }],
            { includeCommunication: true }
        )
        expect(h.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "asso@example.com",
                cc: [
                    "lea@example.com",
                    "Évènements FARE <evenements@fare-asso.fr>"
                ],
                replyTo: "Évènements FARE <evenements@fare-asso.fr>",
                attachments: [
                    {
                        filename: "[FARE] Contrat Bagad'Asso #1.pdf",
                        contentType: "application/pdf",
                        content: Buffer.from("%PDF-1.7")
                    }
                ]
            })
        )
        expect(h.claim).toHaveBeenCalledWith({
            where: {
                id: 1,
                deleted: null,
                validated: null,
                equipmentRevision: 0
            },
            data: {
                validated: expect.any(Date),
                equipmentRevision: { increment: 1 }
            }
        })
        expect(h.updateLines).toHaveBeenNthCalledWith(1, {
            where: { ticketId: 1 },
            data: { includedInContract: false }
        })
        expect(h.updateLines).toHaveBeenNthCalledWith(2, {
            where: { ticketId: 1, equipmentId: { in: [1] } },
            data: { includedInContract: true }
        })
    })

    it.each([true, false])(
        "passes communication=%s consistently to PDF and email",
        async (includeCommunication) => {
            expect(
                await sendContractAction({ ...input, includeCommunication })
            ).toEqual({ success: true })
            expect(h.generatePdf).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                { includeCommunication }
            )
            expect(h.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: includeCommunication
                        ? expect.stringContaining("kit de communication")
                        : expect.not.stringContaining("kit de communication")
                })
            )
            expect(h.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: includeCommunication
                        ? expect.stringContaining("canva.link")
                        : expect.not.stringContaining("canva.link")
                })
            )
        }
    )

    it("captures PDF failures without sending", async () => {
        h.generatePdf.mockRejectedValueOnce(new Error("pdf down"))
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Echec de la génération du contrat PDF"
        })
        expect(h.capture).toHaveBeenCalledOnce()
        expect(h.sendEmail).not.toHaveBeenCalled()
    })

    it("does not persist selection if the email fails", async () => {
        h.sendEmail.mockResolvedValueOnce({ success: false })
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Echec de l'envoi du contrat"
        })
        expect(h.transaction).not.toHaveBeenCalled()
    })

    it("does not finalize a concurrent change", async () => {
        h.claim.mockResolvedValueOnce({ count: 0 })
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Le contrat a été envoyé, mais le ticket a été modifié entre-temps. Vérifiez les informations avant un nouvel envoi."
        })
        expect(h.updateLines).not.toHaveBeenCalled()
        expect(h.capture).not.toHaveBeenCalled()
    })

    it.each(["transaction", "claim", "updateLines"] as const)(
        "reports %s failures after sending",
        async (operation) => {
            h[operation].mockRejectedValueOnce(new Error("db down"))
            expect(await sendContractAction(input)).toEqual({
                success: false,
                error: "Le contrat a été envoyé, mais le ticket n'a pas pu être mis à jour."
            })
            expect(h.capture).toHaveBeenCalledOnce()
        }
    )

    it("rolls back finalization if a selected line disappears", async () => {
        h.updateLines
            .mockResolvedValueOnce({ count: 1 })
            .mockResolvedValueOnce({ count: 0 })
        expect(await sendContractAction(input)).toEqual({
            success: false,
            error: "Le contrat a été envoyé, mais le ticket n'a pas pu être mis à jour."
        })
        expect(h.capture).toHaveBeenCalledOnce()
    })
})
