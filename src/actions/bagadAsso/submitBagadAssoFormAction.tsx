import { render } from "react-email"
import { isDevelopment } from "std-env"

import NewBagadAssoTicket from "@/../emails/bagadasso/new-ticket"
import NewBagadAssoTicketAck from "@/../emails/bagadasso/new-ticket-ack"
import {
    type BagadAssoFormData,
    BagadAssoFormSchema
} from "@/components/public/bagadAsso/form-schema"
import { verifyCaptcha } from "@/helpers/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { locationDisplayName } from "@/helpers/location"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

import type { EquipmentWithDetails } from "./listEquipmentsAction"

export type FormState =
    | { success: true }
    | {
          success: false
          error: string
          fieldErrors?: Partial<Record<keyof BagadAssoFormData, string[]>>
      }

async function submitBagadAssoFormActionImpl(
    data: BagadAssoFormData
): Promise<FormState> {
    // Validate the data using Zod schema
    const result = BagadAssoFormSchema.safeParse(data)

    if (!result.success) {
        // Extract field errors from Zod
        const fieldErrors: Partial<Record<keyof BagadAssoFormData, string[]>> =
            {}
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof BagadAssoFormData
            if (!fieldErrors[field]) {
                fieldErrors[field] = []
            }
            fieldErrors[field].push(issue.message)
        }

        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides.",
            fieldErrors
        }
    }

    const validatedData = result.data

    // Verify CAPTCHA in production
    if (!isDevelopment) {
        if (!validatedData.captchaToken) {
            return { success: false, error: "Veuillez compléter le CAPTCHA." }
        }

        const isCaptchaValid = await verifyCaptcha(validatedData.captchaToken)
        if (!isCaptchaValid) {
            return {
                success: false,
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // Create the ticket in the database
    const ticket = await tryCatch(
        prisma.bagadAssoTicket.create({
            data: {
                association: validatedData.associationName,
                associationEmail: validatedData.associationEmail,
                firstName: validatedData.referentFirstName,
                lastName: validatedData.referentLastName,
                position: validatedData.referentPosition,
                phoneNumber: validatedData.referentPhone,
                representativeEmail: validatedData.referentEmail,
                eventName: validatedData.eventName,
                eventType: validatedData.eventType,
                eventDate: validatedData.eventDate,
                eventAddr: validatedData.eventAddress,
                estimatedParticipants: validatedData.eventParticipants,
                equipments: validatedData.equipment
            }
        })
    )
    if (!ticket.success) {
        captureActionError(ticket.error)
        return {
            success: false,
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        }
    }
    const ticketRecord = ticket.value

    const equipments = (
        JSON.parse(
            validatedData.equipment
        ) as EquipmentWithDetails["equipment"][]
    ).map((eq) => ({
        name: eq.name,
        quantity: eq.quantity
    }))

    // Email is best-effort: the ticket has already been persisted.
    await Promise.allSettled([
        sendEmail({
            to: "evenement@fare-asso.fr",
            subject: `Nouveau ticket bagad'Asso #${ticketRecord.id}`,
            html: await render(
                <NewBagadAssoTicket
                    data={{
                        ...ticketRecord,
                        eventAddr: locationDisplayName(ticketRecord.eventAddr)
                    }}
                />
            )
        }),
        sendEmail({
            to: [
                ticketRecord.associationEmail,
                ticketRecord.representativeEmail
            ],
            subject: `Votre demande Bagad'Asso #${ticketRecord.id}`,
            html: await render(
                <NewBagadAssoTicketAck
                    data={{
                        ...ticketRecord,
                        eventAddr: locationDisplayName(ticketRecord.eventAddr),
                        equipments
                    }}
                />
            )
        })
    ])

    return { success: true }
}

export const submitBagadAssoFormAction = wrapAction(
    "submitBagadAssoFormAction",
    submitBagadAssoFormActionImpl
)
