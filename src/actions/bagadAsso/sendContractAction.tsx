import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"
import { render } from "react-email"

import BagadAssoContractEmail from "@/../emails/bagadasso/contract"
import {
    generateContractPdf,
    type ContractEquipment
} from "@/helpers/bagadAsso/generateContractPdf"
import { ticketEquipmentInclude } from "@/helpers/bagadAsso/ticketEquipment"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const SendContractSchema = type({
    ticketId: "0 < number.integer <= 2147483647",
    equipmentIds: type("0 < number.integer <= 2147483647").array(),
    "includeCommunication?": "boolean",
    "additionalParagraph?": "string"
})

async function sendContractActionImpl(
    input: typeof SendContractSchema.infer,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:bagad-ticket")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const data = SendContractSchema(input)
    if (
        data instanceof type.errors ||
        data.equipmentIds.length === 0 ||
        new Set(data.equipmentIds).size !== data.equipmentIds.length
    ) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const found = await tryCatch(
        prisma.bagadAssoTicket.findUnique({
            where: { id: data.ticketId },
            include: ticketEquipmentInclude
        })
    )
    if (!found.success) {
        captureActionError(found.error)
        return { success: false, error: "Echec de la récupération du ticket" }
    }
    const ticket = found.value
    if (!ticket || ticket.deleted || ticket.validated) {
        return {
            success: false,
            error: "Ce ticket ne peut pas recevoir de contrat"
        }
    }

    const equipmentById = new Map(
        ticket.equipments.map((line) => [line.equipmentId, line])
    )
    const equipments: ContractEquipment[] = data.equipmentIds.flatMap((id) => {
        const line = equipmentById.get(id)
        return line && !line.equipment.deletedAt && line.allocatedQuantity > 0
            ? [
                  {
                      id,
                      name: line.equipment.name,
                      deposit: line.equipment.deposit,
                      quantity: line.allocatedQuantity
                  }
              ]
            : []
    })
    if (equipments.length !== data.equipmentIds.length) {
        return { success: false, error: "Matériel sélectionné invalide" }
    }

    const includeCommunication = data.includeCommunication ?? true
    const pdf = await tryCatch(() =>
        generateContractPdf(ticket, equipments, { includeCommunication })
    )
    if (!pdf.success) {
        captureActionError(pdf.error)
        return {
            success: false,
            error: "Echec de la génération du contrat PDF"
        }
    }

    // send email
    const email = await sendEmail({
        to: ticket.associationEmail,
        cc: [
            ticket.representativeEmail,
            "Évènements FARE <evenements@fare-asso.fr>"
        ],
        replyTo: "Évènements FARE <evenements@fare-asso.fr>",
        subject: `[FARE] Contrat Bagad'Asso ${ticket.association} #${ticket.id}`,
        html: await render(
            <BagadAssoContractEmail
                data={{
                    eventDate: ticket.eventDate,
                    eventEndDate: ticket.eventEndDate,
                    id: ticket.id,
                    includeCommunication,
                    additionalParagraph: data.additionalParagraph
                }}
            />
        ),
        attachments: [
            {
                filename: `[FARE] Contrat Bagad'Asso #${ticket.id}.pdf`,
                content: pdf.value,
                contentType: "application/pdf"
            }
        ]
    })

    if (!email.success) {
        return { success: false, error: "Echec de l'envoi du contrat" }
    }

    const saved = await tryCatch(() =>
        prisma.$transaction(async (tx): Promise<ActionResult> => {
            const claim = await tx.bagadAssoTicket.updateMany({
                where: {
                    id: ticket.id,
                    deleted: null,
                    validated: null,
                    equipmentRevision: ticket.equipmentRevision
                },
                data: {
                    validated: new Date(),
                    equipmentRevision: { increment: 1 }
                }
            })
            if (claim.count !== 1) {
                return {
                    success: false,
                    error: "Le contrat a été envoyé, mais le ticket a été modifié entre-temps. Vérifiez les informations avant un nouvel envoi."
                }
            }
            await tx.bagadAssoTicketEquipment.updateMany({
                where: { ticketId: ticket.id },
                data: { includedInContract: false }
            })
            const selected = await tx.bagadAssoTicketEquipment.updateMany({
                where: {
                    ticketId: ticket.id,
                    equipmentId: { in: data.equipmentIds }
                },
                data: { includedInContract: true }
            })
            if (selected.count !== data.equipmentIds.length) {
                throw new Error(
                    "Contract equipment changed during finalization"
                )
            }
            return { success: true }
        })
    )
    if (!saved.success) {
        captureActionError(saved.error)
        return {
            success: false,
            error: "Le contrat a été envoyé, mais le ticket n'a pas pu être mis à jour."
        }
    }

    return saved.value
}

export const sendContractAction = wrapAction(
    "sendContractAction",
    sendContractActionImpl
)
