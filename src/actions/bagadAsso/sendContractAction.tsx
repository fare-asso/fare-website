import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"
import { render } from "react-email"

import BagadAssoContractEmail from "@/../emails/bagadasso/contract"
import {
    generateContractPdf,
    type ContractEquipment
} from "@/helpers/bagadAsso/generateContractPdf"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const SendContractSchema = type({
    ticketId: "number.integer > 0",
    equipmentIds: type("number.integer > 0").array()
})

const TicketEquipmentsSchema = type({
    id: "number.integer > 0",
    quantity: "number.integer > 0"
}).array()

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
        prisma.bagadAssoTicket.findUnique({ where: { id: data.ticketId } })
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

    const storedEquipments = tryCatch(() =>
        typeof ticket.equipments === "string"
            ? JSON.parse(ticket.equipments)
            : ticket.equipments
    )
    if (!storedEquipments.success) {
        captureActionError(storedEquipments.error)
        return { success: false, error: "Matériel du ticket invalide" }
    }
    const requested = TicketEquipmentsSchema(storedEquipments.value)
    if (requested instanceof type.errors) {
        return { success: false, error: "Matériel du ticket invalide" }
    }
    const quantities = new Map(
        requested.map((item) => [item.id, item.quantity])
    )
    if (data.equipmentIds.some((id) => !quantities.has(id))) {
        return { success: false, error: "Matériel sélectionné invalide" }
    }

    const foundEquipments = await tryCatch(
        prisma.bagadAssoEquipment.findMany({
            where: { id: { in: data.equipmentIds } },
            select: { id: true, name: true, deposit: true }
        })
    )
    if (!foundEquipments.success) {
        captureActionError(foundEquipments.error)
        return { success: false, error: "Echec de la récupération du matériel" }
    }
    if (foundEquipments.value.length !== data.equipmentIds.length) {
        return { success: false, error: "Matériel sélectionné introuvable" }
    }
    const equipmentById = new Map(
        foundEquipments.value.map((item) => [item.id, item])
    )
    const equipments: ContractEquipment[] = data.equipmentIds.flatMap((id) => {
        const equipment = equipmentById.get(id)
        const quantity = quantities.get(id)
        return equipment && quantity
            ? [
                  {
                      id: equipment.id,
                      name: equipment.name,
                      deposit: equipment.deposit,
                      quantity
                  }
              ]
            : []
    })
    if (equipments.length !== data.equipmentIds.length) {
        return { success: false, error: "Matériel sélectionné invalide" }
    }

    const pdf = await tryCatch(() => generateContractPdf(ticket, equipments))
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
        bcc: ticket.representativeEmail,
        subject: `[FARE] Contrat Bagad asso ${ticket.association} #${ticket.id}`,
        html: await render(
            <BagadAssoContractEmail
                data={{
                    eventDate: ticket.eventDate,
                    eventEndDate: ticket.eventEndDate,
                    id: ticket.id
                }}
            />
        ),
        attachments: [
            {
                filename: `[FARE] Contrat Bagad-Asso ${ticket.id}.pdf`,
                content: pdf.value,
                contentType: "application/pdf"
            }
        ]
    })

    if (!email.success) {
        return { success: false, error: "Echec de l'envoi du contrat" }
    }

    const saved = await tryCatch(
        prisma.bagadAssoTicket.update({
            where: {
                id: ticket.id
            },
            data: {
                validated: new Date()
            }
        })
    )
    if (!saved.success) {
        captureActionError(saved.error)
        return {
            success: false,
            error: "Le contrat a été envoyé, mais le ticket n'a pas pu être mis à jour."
        }
    }

    return { success: true }
}

export const sendContractAction = wrapAction(
    "sendContractAction",
    sendContractActionImpl
)
