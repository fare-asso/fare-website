import { createServerFn } from "@tanstack/react-start"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { verifyCaptcha } from "@/components/captcha/verify.server"
import { sendEmail } from "@/helpers/email.server"
import { withServerAction } from "@/lib/sentry.server"
import { type Contact, ContactSchema } from "@/schemas/contact"

import ContactTemplate from "../../../emails/contact"

export type FormState = {
    error?: string
    success?: boolean
    fieldErrors?: Partial<Record<keyof Contact, string[]>>
}

export const submitContactFormAction = createServerFn({ method: "POST" })
    .validator((data: Contact) => data)
    .handler(
        withServerAction(
            "submitContactFormAction",
            async ({ data }): Promise<FormState> => {
                const parsed = ContactSchema.safeParse(data)

                if (!parsed.success) {
                    const fieldErrors: Partial<
                        Record<keyof Contact, string[]>
                    > = {}
                    for (const issue of parsed.error.issues) {
                        const field = issue.path[0] as keyof Contact
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

                    const isCaptchaValid = await verifyCaptcha(
                        validatedData.captchaToken
                    )
                    if (!isCaptchaValid) {
                        return {
                            error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
                        }
                    }
                }

                const emailTransporterRes = await sendEmail({
                    to: "contact@fare-asso.fr",
                    subject: `${validatedData.firstName} ${validatedData.lastName} veut vous contacter`,
                    html: await render(
                        <ContactTemplate
                            firstName={validatedData.firstName}
                            lastName={validatedData.lastName}
                            message={validatedData.message}
                            email={validatedData.email}
                        />
                    )
                })

                if (!emailTransporterRes.success) {
                    return {
                        error: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
                    }
                }

                return { success: true }
            }
        )
    )
