import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { BtpContact } from "@/../emails/btp-contact"
import { verifyCaptcha } from "@/helpers/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"

async function submitTutorQuestionImpl(
    data: BTPTutorQuestion
): Promise<ActionResult> {
    const parsedData = BTPTutorQuestionSchema(data)

    if (parsedData instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    // Verify CAPTCHA in production
    if (!isDevelopment) {
        if (!parsedData.captchaToken) {
            return {
                success: false,
                error: "Veuillez compléter le CAPTCHA."
            }
        }

        const isCaptchaValid = await verifyCaptcha(parsedData.captchaToken)
        if (!isCaptchaValid) {
            return {
                success: false,
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // Insert the data into the database
    const created = await tryCatch(
        prisma.bTPTutorQuestion.create({
            data: {
                firstName: parsedData.firstName,
                lastName: parsedData.lastName,
                email: parsedData.email,
                major: parsedData.major,
                studyYear: parsedData.studyYear,
                question: parsedData.message
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Echec de l'enregistrement de la question. Veuillez réessayer."
        }
    }
    const createdQuestion = created.value

    // Email is best-effort: the question has already been persisted.
    // sendEmail reports its own failures to Sentry.
    if (!isDevelopment) {
        await sendEmail({
            to: "intervention-carceral@fare-asso.fr",
            subject: "Nouvelle question tutorat Bouge Ta Prison",
            html: await render(
                <BtpContact
                    firstName={parsedData.firstName}
                    lastName={parsedData.lastName}
                    email={parsedData.email}
                    message={parsedData.message}
                    id={createdQuestion.id}
                />
            )
        })
    }

    return { success: true }
}

export const submitTutorQuestion = wrapAction(
    "submitTutorQuestion",
    submitTutorQuestionImpl
)
