import nodemailer from "nodemailer"
import { isProduction } from "std-env"
import { env } from "@/env"

interface EmailAttachment {
    filename: string
    content: Buffer
    contentType?: string
}

interface EmailPayload {
    to: string
    subject: string
    html: string
    attachments?: EmailAttachment[]
}

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
})

export async function sendEmail(
    payload: EmailPayload
): Promise<{ error?: string; success?: boolean }> {
    const { to, subject, html, attachments } = payload

    try {
        await transporter.sendMail({
            from: `FARE <${env.SMTP_FROM_EMAIL}>`,
            to: isProduction ? to : "outils-numeriques@fare-asso.fr",
            subject: isProduction ? subject : `TEST - ${subject}`,
            html,
            attachments
        })
        return { success: true }
    } catch (error: unknown) {
        console.error("Error sendEmail: ", error)
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
        return { success: false, error: errorMessage }
    }
}
