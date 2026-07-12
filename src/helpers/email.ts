import nodemailer from "nodemailer"
import type { MailOptions } from "nodemailer/lib/smtp-transport"
import { isProduction } from "std-env"

import { env } from "@/env"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface EmailAttachment {
    filename: string
    content: Buffer
    contentType?: string
}

interface EmailPayload {
    to: MailOptions["to"]
    subject: string
    html: string
    attachments?: EmailAttachment[]
}

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
})

/**
 * Send an email via the configured SMTP transport.
 *
 * Failures are caught and reported to Sentry internally via
 * `captureActionError` — callers receive `{ success: false }` with no
 * `error` field because the error is already handled. Narrow on
 * `.success` to decide whether to abort the surrounding action; do NOT
 * wrap this call in a `try/catch`.
 */
export async function sendEmail(
    payload: EmailPayload
): Promise<{ success: true } | { success: false }> {
    const { to, subject, html, attachments } = payload

    const result = await tryCatch(
        transporter.sendMail({
            from: `FARE <${env.SMTP_FROM_EMAIL}>`,
            to: isProduction ? to : "outils-numeriques@fare-asso.fr",
            subject: isProduction ? subject : `TEST - ${subject}`,
            html,
            attachments
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false }
    }
    return { success: true }
}
