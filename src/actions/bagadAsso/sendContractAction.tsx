import type { ActionAPIContext } from "astro:actions"
import { render } from "react-email"

import BagadAssoContractEmail from "@/../emails/bagadasso/contract"
import type { EquipmentLine } from "@/components/dashboard/bagadAsso/tickets/ticketContext"
import type { BagadAssoTicket } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function sendContractActionImpl(
    {
        ticket,
        equipments
    }: {
        equipments: EquipmentLine[]
        ticket: BagadAssoTicket
    },
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

    // generate pdf contract
    const pdf = generateContractPdf()

    // send email
    await sendEmail({
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
                content: pdf,
                contentType: "application/pdf"
            }
        ]
    })

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
            error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
        }
    }

    return { success: true }
}

export const sendContractAction = wrapAction(
    "sendContractAction",
    sendContractActionImpl
)

function generateContractPdf(): Buffer {
    return Buffer.from("")
}
