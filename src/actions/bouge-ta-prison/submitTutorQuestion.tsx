"use server"

import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { captureActionError, withServerAction } from "@/lib/sentry"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"
import type { ActionResponse } from "@/types/actions"

import { BtpContact } from "../../../emails/btp-contact"

async function submitTutorQuestionImpl(
    data: BTPTutorQuestion
): Promise<ActionResponse> {
    const parsedData = BTPTutorQuestionSchema.safeParse(data)

    if (!parsedData.success) {
        const fieldErrors: Record<string, string[]> = {}
        for (const issue of parsedData.error.issues) {
            const field = String(issue.path[0])
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

    // Verify CAPTCHA in production
    if (!isDevelopment) {
        if (!parsedData.data.captchaToken) {
            return {
                error: "Veuillez compléter le CAPTCHA."
            }
        }

        const isCaptchaValid = await verifyCaptcha(parsedData.data.captchaToken)
        if (!isCaptchaValid) {
            return {
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // Insert the data into the database
    let createdQuestion: Awaited<
        ReturnType<typeof prisma.bTPTutorQuestion.create>
    >
    try {
        createdQuestion = await prisma.bTPTutorQuestion.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                major: data.major,
                studyYear: data.studyYear,
                question: data.message
            }
        })
    } catch (error) {
        captureActionError(error)
        return {
            error: "Echec de l'enregistrement de la question. Veuillez réessayer."
        }
    }

    // Email is best-effort: the question has already been persisted.
    if (!isDevelopment) {
        try {
            await sendEmail({
                to: "intervention-carceral@fare-asso.fr",
                subject: "Nouvelle question tutorat Bouge Ta Prison",
                html: await render(
                    <BtpContact
                        firstName={data.firstName}
                        lastName={data.lastName}
                        email={data.email}
                        message={data.message}
                        id={createdQuestion.id}
                    />
                )
            })
        } catch (error) {
            captureActionError(error)
        }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction("submitTutorQuestion", submitTutorQuestionImpl)
