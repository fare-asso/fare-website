"use server"

import { revalidatePath } from "next/cache"
import { isDevelopment, isProduction } from "std-env"
import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { bagadAssoTicketEmailTemplate } from "@/lib/htmlEmailTemplates"

export default async function submitBagadAssoFormAction(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    if (!isDevelopment) {
        // Retrieve CAPTCHA value
        const captchaValue = formData.get("frc-captcha-response")?.toString()

        // Verify CAPTCHA
        if (!captchaValue) {
            return { error: "Veuillez compléter le CAPTCHA." }
        }

        const isCaptchaValid = await verifyCaptcha(captchaValue)
        if (!isCaptchaValid) {
            return {
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // retrieve form data fields
    const associationName = formData.get("association-name")?.toString()
    const associationEmail = formData.get("association-email")?.toString()
    const associationReferentName = formData
        .get("association-referent-name")
        ?.toString()
    const associationReferentFirstName = formData
        .get("association-referent-first-name")
        ?.toString()
    const associationReferentEmail = formData
        .get("association-referent-email")
        ?.toString()
    const associationReferentPhone = formData
        .get("association-referent-phone")
        ?.toString()
    const eventName = formData.get("event-name")?.toString()
    const eventType = formData.get("event-type")?.toString()
    const eventDate = formData.get("event-date")?.toString()
    const eventAddress = formData.get("event-address")?.toString()
    const eventParticipants = Number(formData.get("event-participants"))
    const equipmentInput = formData.get("equipment-input")?.toString()
    const termsAndConditions = formData.get("terms-and-conditions")?.toString()

    // Debug logs
    console.log("Association Name:", associationName)
    console.log("Association Email:", associationEmail)
    console.log("Referent Name:", associationReferentName)
    console.log("Referent First Name:", associationReferentFirstName)
    console.log("Referent Email:", associationReferentEmail)
    console.log("Referent Phone:", associationReferentPhone)
    console.log("Event Name:", eventName)
    console.log("Event Type:", eventType)
    console.log("Event Date:", eventDate)
    console.log("Event Address:", eventAddress)
    console.log("Event Participants:", eventParticipants)
    console.log("Equipment Input:", equipmentInput)
    console.log("Terms and Conditions:", termsAndConditions)

    // data validation
    if (
        !associationName ||
        !associationEmail ||
        !associationReferentName ||
        !associationReferentFirstName ||
        !associationReferentEmail ||
        !associationReferentPhone ||
        !eventName ||
        !eventType ||
        !eventDate ||
        !eventAddress ||
        Number.isNaN(eventParticipants) ||
        !equipmentInput ||
        !termsAndConditions
    ) {
        return {
            error: "Un ou plusieurs champs ne sont pas remplis."
        }
    }

    // terms and conditions
    if (termsAndConditions !== "on") {
        return { error: "Veuillez accepter les termes et conditions" }
    }

    // Check if event_date is a valid date
    const eventDateObject = new Date(eventDate)
    if (Number.isNaN(eventDateObject.getTime())) {
        return { error: "La date de l'événement n'est pas valide." }
    }

    let ticketRecord: Awaited<ReturnType<typeof prisma.bagadAssoTicket.create>>
    try {
        ticketRecord = await prisma.bagadAssoTicket.create({
            data: {
                assocation: associationName,
                associationEmail: associationEmail,
                firstName: associationReferentFirstName,
                lastName: associationName,
                phoneNumber: associationReferentPhone,
                representativeEmail: associationReferentEmail,
                eventName: eventName,
                eventType: eventType,
                eventDate: eventDateObject,
                eventAddr: eventAddress,
                estimatedParticipants: eventParticipants,
                equipments: equipmentInput
            }
        })
    } catch {
        return {
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        }
    }

    try {
        if (isProduction) {
            const emailTransporterResponse = await sendEmail({
                to: "evenement@fare-asso.fr",
                subject: `Nouveau ticket bagad'Asso #${ticketRecord.id}`,
                html: bagadAssoTicketEmailTemplate(
                    ticketRecord.id,
                    ticketRecord.assocation,
                    ticketRecord.eventDate,
                    ticketRecord.eventName
                )
            })

            if (emailTransporterResponse.error) {
                console.log("[ERROR] Failed to send email notification email")
            }
        }

        revalidatePath("/dashboard/bagadAsso")
        return { success: true }
    } catch {
        console.error(
            "Failed to send Bagad'Asso ticket creation notification email"
        )
        return {
            error: "Une erreur est survenue lors de la création du ticket. Merci de réessayer plus tard."
        }
    }
}
