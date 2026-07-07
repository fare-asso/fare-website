import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { BtpContact } from "@/../emails/btp-contact"
import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"
import type { ActionResponse } from "@/types/actions"

async function submitTutorQuestionImpl(
    data: BTPTutorQuestion
): Promise<ActionResponse> {
    const parsedData = BTPTutorQuestionSchema(data)

    if (parsedData instanceof type.errors) {
        const fieldErrors: Record<string, string[]> = {}
        for (const issue of parsedData.issues) {
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
        if (!parsedData.captchaToken) {
            return {
                error: "Veuillez compléter le CAPTCHA."
            }
        }

        const isCaptchaValid = await verifyCaptcha(parsedData.captchaToken)
        if (!isCaptchaValid) {
            return {
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

const submitTutorQuestionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof submitTutorQuestionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "submitTutorQuestion",
            submitTutorQuestionImpl
        )(...unpackActionArgs<Parameters<typeof submitTutorQuestionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof submitTutorQuestionImpl>
): ReturnType<typeof submitTutorQuestionImpl> =>
    submitTutorQuestionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof submitTutorQuestionImpl>
