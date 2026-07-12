import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { NewBagadAssoSuggestion } from "@/../emails/bagadasso/new-suggestion"
import { verifyCaptcha } from "@/helpers/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    BagadAssoSuggestionSchema,
    equipmentTypeLabel,
    type TBagadAssoSuggestion
} from "@/schemas/bagadAsso"

async function submitSuggestionActionImpl(
    input: TBagadAssoSuggestion
): Promise<ActionResult> {
    const data = BagadAssoSuggestionSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    // Verify CAPTCHA in production
    if (!isDevelopment) {
        if (!data.captchaToken) {
            return { success: false, error: "Veuillez compléter le CAPTCHA." }
        }

        const isCaptchaValid = await verifyCaptcha(data.captchaToken)
        if (!isCaptchaValid) {
            return {
                success: false,
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    const created = await tryCatch(
        prisma.bagadAssoSuggestion.create({
            data: {
                equipmentName: data.equipmentName,
                equipmentType: data.equipmentType,
                referenceUrl: data.referenceUrl || null,
                associationName: data.associationName,
                firstName: data.firstName,
                lastName: data.lastName,
                position: data.position,
                contactEmail: data.contactEmail,
                details: data.details
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Échec de l'envoi de la suggestion. Veuillez réessayer."
        }
    }
    const suggestion = created.value

    // Email is best-effort: the suggestion has already been persisted.
    await sendEmail({
        to: "evenement@fare-asso.fr",
        subject: `Nouvelle suggestion de matériel Bagad'Asso #${suggestion.id}`,
        html: await render(
            <NewBagadAssoSuggestion
                data={{
                    ...suggestion,
                    equipmentType: equipmentTypeLabel(suggestion.equipmentType)
                }}
            />
        )
    })

    return { success: true }
}

export const submitSuggestionAction = wrapAction(
    "submitSuggestionAction",
    submitSuggestionActionImpl
)
