"use server"

import prisma from "@/helpers/db"

import { revalidatePath } from "next/cache"

import { verifyCaptcha } from "@/helpers/captcha"
import { sendEmail } from "@/helpers/email"
import { bagadAssoTicketEmailTemplate } from "@/lib/htmlEmailTemplates"

export default async function submitBagadAssoFormAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Retrieve CAPTCHA value
    const captchaValue = formData.get("g-recaptcha-response")?.toString()

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

    // retrieve form data fields
    const association_name = formData.get("association-name")?.toString()
    const association_email = formData.get("association-email")?.toString()
    const association_referent_name = formData
        .get("association-referent-name")
        ?.toString()
    const association_referent_first_name = formData
        .get("association-referent-first-name")
        ?.toString()
    const association_referent_email = formData
        .get("association-referent-email")
        ?.toString()
    const association_referent_phone = formData
        .get("association-referent-phone")
        ?.toString()
    const event_name = formData.get("event-name")?.toString()
    const event_type = formData.get("event-type")?.toString()
    const event_date = formData.get("event-date")?.toString()
    const event_address = formData.get("event-address")?.toString()
    const event_participants = Number(formData.get("event-participants"))
    const equipment_input = formData.get("equipment-input")?.toString()
    const terms_and_conditions = formData
        .get("terms-and-conditions")
        ?.toString()

    // Debug logs
    console.log("Association Name:", association_name)
    console.log("Association Email:", association_email)
    console.log("Referent Name:", association_referent_name)
    console.log("Referent First Name:", association_referent_first_name)
    console.log("Referent Email:", association_referent_email)
    console.log("Referent Phone:", association_referent_phone)
    console.log("Event Name:", event_name)
    console.log("Event Type:", event_type)
    console.log("Event Date:", event_date)
    console.log("Event Address:", event_address)
    console.log("Event Participants:", event_participants)
    console.log("Equipment Input:", equipment_input)
    console.log("Terms and Conditions:", terms_and_conditions)

    // data validation
    if (
        !association_name ||
        !association_email ||
        !association_referent_name ||
        !association_referent_first_name ||
        !association_referent_email ||
        !association_referent_phone ||
        !event_name ||
        !event_type ||
        !event_date ||
        !event_address ||
        isNaN(event_participants) ||
        !equipment_input ||
        !terms_and_conditions
    ) {
        return {
            error: "Un ou plusieurs champs ne sont pas remplis."
        }
    }

    // terms and conditions
    if (terms_and_conditions !== "on") {
        return { error: "Veuillez accepter les termes et conditions" }
    }

    // Check if event_date is a valid date
    const eventDateObject = new Date(event_date)
    if (isNaN(eventDateObject.getTime())) {
        return { error: "La date de l'événement n'est pas valide." }
    }

    try {
        const ticketRecord = await prisma.bagadAssoTicket.create({
            data: {
                assocation: association_name,
                associationEmail: association_email,
                firstName: association_referent_first_name,
                lastName: association_name,
                phoneNumber: association_referent_phone,
                representativeEmail: association_referent_email,
                eventName: event_name,
                eventType: event_type,
                eventDate: eventDateObject,
                eventAddr: event_address,
                estimatedParticipants: event_participants,
                equipments: equipment_input
            }
        })

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

        revalidatePath("/dashboard/bagadAsso")
        return { success: true }
    } catch {
        return {
            error: "Le formulaire est incorrect. Veuillez recharger la page et réessayer."
        }
    }
}
