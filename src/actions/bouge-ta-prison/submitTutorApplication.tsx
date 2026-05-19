"use server"

import { revalidatePath } from "next/cache"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
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

    const parsedData = BTPTutorApplicationSchema.safeParse(data)

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

    // Generate a random folder name for the storage
    const firstInitial = parsedData.data.firstName.toLowerCase().at(0) ?? ""
    const sanitizedName =
        sanitizeString(firstInitial) +
        sanitizeString(parsedData.data.lastName.toLowerCase())

    const folderName = `${crypto.randomUUID()}-${sanitizedName}`

    // Upload the CV and the motivation letter to the storage
    const supabase = await createClient()

    const { data: cvUploadData, error: cvUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(`${folderName}/cv-${sanitizedName}.pdf`, parsedData.data.cv)
    if (cvUploadError) {
        return {
            error: "Echec de l'upload du CV"
        }
    }

    const { data: lmUploadData, error: lmUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(
            `${folderName}/lm-${sanitizedName}.pdf`,
            parsedData.data.motivationLetter
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
    try {
        await prisma.bTPTutorApplication.create({
            data: {
                firstName: parsedData.data.firstName,
                lastName: parsedData.data.lastName,
                email: parsedData.data.email,
                major: parsedData.data.major,
                studyYear: parsedData.data.studyYear,
                cvPath: cvUploadData.path,
                mlPath: lmUploadData.path
            }
        })
    } catch (error) {
        captureActionError(error)
        // Clean up uploaded files
        await supabase.storage
            .from("btp-tutor-application")
            .remove([cvUploadData.path, lmUploadData.path])
        return {
            error: "Echec de la création de la candidature. Veuillez réessayer."
        }
    }

    // Email is best-effort: the application has already been persisted.
    try {
        await sendEmail({
            to: "intervention-carceral@fare-asso.fr",
            subject: "Nouvelle candidature de tuteur Bouge Ta Prison",
            html: await render(<BtpApplication data={parsedData.data} />)
        })
    } catch (error) {
        captureActionError(error)
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "submitTutorApplication",
    submitTutorApplicationImpl
)
