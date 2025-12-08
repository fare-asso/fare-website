"use server"

import type { BTPTutorApplication } from "@prisma/client"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { tutorApplicationApprovalEmailTemplate } from "@/lib/htmlEmailTemplates"

export default async function sendApprovalEmail(
    application: BTPTutorApplication
): Promise<{
    success: boolean
    error: string | null
}> {
    console.log("Sending approval email to", application.email)
    // Send email
    const { success } = await sendEmail({
        to: application.email,
        subject: "Bouge Ta Prison - Informations sur votre candidature",
        html: tutorApplicationApprovalEmailTemplate(application)
    })

    if (!success) {
        return {
            success: false,
            error: " L'email n'a pas pu être envoyé. Veuillez réessayer plus tard."
        }
    }
    const _updatedApplication = await prisma.bTPTutorApplication.update({
        where: {
            id: application.id
        },
        data: {
            approved: true
        }
    })
    revalidatePath("/dashboard/bouge-ta-prison/candidatures-tutorat/18")
    revalidatePath("/dashboard/bouge-ta-prison?tab=candidatures")
    return {
        success: true,
        error: null
    }
}
