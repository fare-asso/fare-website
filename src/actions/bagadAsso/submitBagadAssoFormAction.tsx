import { createServerFn } from "@tanstack/react-start"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/components/captcha/verify"
import {
    type BagadAssoFormData,
    BagadAssoFormSchema
} from "@/components/public/bagadAsso/form-schema"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { locationDisplayName } from "@/helpers/location"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

import NewBagadAssoTicket from "../../../emails/badagasso-ticket"

export type FormState = {
    error?: string
    success?: boolean
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
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        }
    }
    const ticketRecord = ticket.value

    // Email is best-effort: the ticket has already been persisted.
    await sendEmail({
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
    })

    return { success: true }
}

const submitBagadAssoFormActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (
            data: ActionPayload<
                Parameters<typeof submitBagadAssoFormActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "submitBagadAssoFormAction",
            submitBagadAssoFormActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof submitBagadAssoFormActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof submitBagadAssoFormActionImpl>
): ReturnType<typeof submitBagadAssoFormActionImpl> =>
    submitBagadAssoFormActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof submitBagadAssoFormActionImpl>
