"use server"

import { revalidatePath } from "next/cache"
import { isDevelopment } from "std-env"
import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { type BugReport, BugReportSchema } from "@/schemas/bugReport"

export type FormState = {
    error?: string
    success?: boolean
    fieldErrors?: Partial<Record<keyof BugReport, string[]>>
}

export default async function bugReportAction(
    _prevState: FormState | undefined,
    formData: FormData
): Promise<FormState> {
    // Extract form data
    const data = {
        email: formData.get("email")?.toString() || "",
        bugType: formData.get("bug-type")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        captchaToken: formData.get("frc-captcha-response")?.toString() || ""
    }

    // Validate with Zod
    const parsed = BugReportSchema.safeParse(data)

    if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof BugReport, string[]>> = {}
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as keyof BugReport
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

    const validatedData = parsed.data

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

    // Create bug report
    try {
        await prisma.bugReport.create({
            data: {
                email: validatedData.email,
                type: validatedData.bugType,
                description: validatedData.description
            }
        })

        // Revalidate dashboard page
        revalidatePath("/dashboard/bug-reports")

        return { success: true }
    } catch (e) {
        console.error(e)
        return {
            error: "Echec de l'envoi du rapport... Veuillez réessayer plus tard!"
        }
    }
}
