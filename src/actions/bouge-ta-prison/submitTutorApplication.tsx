import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/helpers/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { BTPTutorApplicationSchema } from "@/schemas/bougeTaPrison"

import BtpApplication from "../../../emails/btp-application"

async function submitTutorApplicationImpl(
    formData: FormData,
    context: ActionAPIContext
): Promise<ActionResult> {
    const data: { [key: string]: FormDataEntryValue } = {}

    for (const [key, value] of formData) {
        data[key] = value
    }

    const parsedData = BTPTutorApplicationSchema(data)

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

    // Generate a random folder name for the storage
    const firstInitial = parsedData.firstName.toLowerCase().at(0) ?? ""
    const sanitizedName =
        sanitizeString(firstInitial) +
        sanitizeString(parsedData.lastName.toLowerCase())

    const folderName = `${crypto.randomUUID()}-${sanitizedName}`

    // Upload the CV and the motivation letter to the storage
    const supabase = createClient(context)

    const { data: cvUploadData, error: cvUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(`${folderName}/cv-${sanitizedName}.pdf`, parsedData.cv)
    if (cvUploadError) {
        return {
            success: false,
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
            success: false,
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
            success: false,
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

export const submitTutorApplication = wrapAction(
    "submitTutorApplication",
    submitTutorApplicationImpl
)
