"use server"

import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { isDevelopment, isProduction } from "std-env"
import { verifyCaptcha } from "@/components/captcha/verify"
import {
    type BagadAssoFormData,
    bagadAssoFormSchema
} from "@/components/public/bagadAsso/form-schema"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import NewBagadAssoTicket from "../../../emails/badagasso-ticket"

export type FormState = {
    error?: string
    success?: boolean
    fieldErrors?: Partial<Record<keyof BagadAssoFormData, string[]>>
}

export default async function submitBagadAssoFormAction(
    _prevState: FormState | undefined,
    data: BagadAssoFormData
): Promise<FormState> {
    // Validate the data using Zod schema
    const result = bagadAssoFormSchema.safeParse(data)

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
            error: "Un ou plusieurs champs sont invalides.",
            fieldErrors
        }
    }

    const validatedData = result.data

    // Verify CAPTCHA in production
    if (!isDevelopment) {
        if (!validatedData.captchaToken) {
            return { error: "Veuillez compléter le CAPTCHA." }
        }

        const isCaptchaValid = await verifyCaptcha(validatedData.captchaToken)
        if (!isCaptchaValid) {
            return {
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // Create the ticket in the database
    let ticketRecord: Awaited<ReturnType<typeof prisma.bagadAssoTicket.create>>
    try {
        ticketRecord = await prisma.bagadAssoTicket.create({
            data: {
                assocation: validatedData.associationName,
                associationEmail: validatedData.associationEmail,
                firstName: validatedData.referentFirstName,
                lastName: validatedData.referentLastName,
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
    } catch (error) {
        console.error("Failed to create Bagad'Asso ticket:", error)
        return {
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        }
    }

    // Send email notification
    try {
        if (isProduction) {
            const emailTransporterResponse = await sendEmail({
                to: "evenement@fare-asso.fr",
                subject: `Nouveau ticket bagad'Asso #${ticketRecord.id}`,
                html: await render(
                    <NewBagadAssoTicket
                        ticketId={ticketRecord.id}
                        associationName={ticketRecord.assocation}
                        eventDate={ticketRecord.eventDate}
                        eventName={ticketRecord.eventName}
                    />
                )
            })

            if (emailTransporterResponse.error) {
                console.error("[ERROR] Failed to send email notification")
            }
        }
    } catch (error) {
        console.error(
            "Failed to send Bagad'Asso ticket creation notification email:",
            error
        )
    }

    revalidatePath("/dashboard/bagadAsso")
    return { success: true }
}
