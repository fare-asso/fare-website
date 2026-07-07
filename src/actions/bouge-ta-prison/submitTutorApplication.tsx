import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { BTPTutorApplicationSchema } from "@/schemas/bougeTaPrison"
import type { ActionResponse } from "@/types/actions"

import BtpApplication from "../../../emails/btp-application"

async function submitTutorApplicationImpl(
    formData: FormData
): Promise<ActionResponse> {
    const data: { [key: string]: FormDataEntryValue } = {}

    for (const [key, value] of formData) {
        data[key] = value
    }

    const parsedData = BTPTutorApplicationSchema(data)

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

    // Generate a random folder name for the storage
    const firstInitial = parsedData.firstName.toLowerCase().at(0) ?? ""
    const sanitizedName =
        sanitizeString(firstInitial) +
        sanitizeString(parsedData.lastName.toLowerCase())

    const folderName = `${crypto.randomUUID()}-${sanitizedName}`

    // Upload the CV and the motivation letter to the storage
    const supabase = createClient()

    const { data: cvUploadData, error: cvUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(`${folderName}/cv-${sanitizedName}.pdf`, parsedData.cv)
    if (cvUploadError) {
        return {
            error: "Echec de l'upload du CV"
        }
    }

    const { data: lmUploadData, error: lmUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(
            `${folderName}/lm-${sanitizedName}.pdf`,
            parsedData.motivationLetter
        )
    if (lmUploadError) {
        // Clean up uploaded CV
        await supabase.storage
            .from("btp-tutor-application")
            .remove([cvUploadData.path])
        return {
            error: "Echec de l'upload de la lettre de motivation"
        }
    }

    // Insert the application in the database
    const created = await tryCatch(
        prisma.bTPTutorApplication.create({
            data: {
                firstName: parsedData.firstName,
                lastName: parsedData.lastName,
                email: parsedData.email,
                major: parsedData.major,
                studyYear: parsedData.studyYear,
                cvPath: cvUploadData.path,
                mlPath: lmUploadData.path
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        // Clean up uploaded files
        await supabase.storage
            .from("btp-tutor-application")
            .remove([cvUploadData.path, lmUploadData.path])
        return {
            error: "Echec de la création de la candidature. Veuillez réessayer."
        }
    }

    // Email is best-effort: the application has already been persisted.
    await sendEmail({
        to: "intervention-carceral@fare-asso.fr",
        subject: "Nouvelle candidature de tuteur Bouge Ta Prison",
        html: await render(<BtpApplication data={parsedData} />)
    })

    return { success: true }
}

const submitTutorApplicationServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof submitTutorApplicationImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "submitTutorApplication",
            submitTutorApplicationImpl
        )(
            ...unpackActionArgs<Parameters<typeof submitTutorApplicationImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof submitTutorApplicationImpl>
): ReturnType<typeof submitTutorApplicationImpl> =>
    submitTutorApplicationServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof submitTutorApplicationImpl>
