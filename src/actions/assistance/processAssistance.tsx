import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { AssistanceTemplate } from "@/../emails/assistance"
import AssistanceAck from "@/../emails/assistance-acknowledgement"
import { verifyCaptcha } from "@/components/captcha/verify.server"
import { getAssistanceConfig } from "@/helpers/assistanceConfig.server"
import { sendEmail } from "@/helpers/email.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import {
    AssistanceFormSchema,
    MOYEN_CONTACT,
    SITUATIONS
} from "@/schemas/assistance"

const MAX_FILE_SIZE = 2 * 1024 * 1024

type Result = { success: true } | { success: false; error: string }

export const processAssistance = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "processAssistance",
            async ({ data: formData }): Promise<Result> => {
                // The form travels as FormData (typed serverFn args cannot
                // carry Files) — rebuild the raw object before validation.
                const stringEntry = (key: string): string => {
                    const entry = formData.get(key)
                    return typeof entry === "string" ? entry : ""
                }
                const ufr = formData.get("ufr")
                const telephone = formData.get("telephone")

                const data = AssistanceFormSchema({
                    prenom: stringEntry("prenom"),
                    nom: stringEntry("nom"),
                    email: stringEntry("email"),
                    etablissement: stringEntry("etablissement"),
                    ...(typeof ufr === "string" ? { ufr } : {}),
                    situation: stringEntry("situation"),
                    message: stringEntry("message"),
                    moyenContact: stringEntry("moyenContact"),
                    ...(typeof telephone === "string" ? { telephone } : {}),
                    pieces: formData
                        .getAll("pieces")
                        .filter(
                            (entry): entry is File => entry instanceof File
                        ),
                    consentement: stringEntry("consentement") === "true",
                    captchaToken: stringEntry("captchaToken")
                })

                if (data instanceof type.errors) {
                    return { success: false, error: data.summary }
                }

                if (!isDevelopment) {
                    const isCaptchaValid = await verifyCaptcha(
                        data.captchaToken
                    )
                    if (!isCaptchaValid) {
                        return {
                            success: false,
                            error: "La vérification du captcha a échoué. Veuillez réessayer."
                        }
                    }
                }

                const pieces = (data.pieces ?? []).filter(
                    (file): file is File => file instanceof File
                )
                if (pieces.some((file) => file.size > MAX_FILE_SIZE)) {
                    return {
                        success: false,
                        error: "Chaque fichier doit faire moins de 2 Mo."
                    }
                }

                const attachmentsResult = await tryCatch(
                    Promise.all(
                        pieces.map(async (file) => ({
                            filename: file.name,
                            content: Buffer.from(await file.arrayBuffer()),
                            contentType: file.type
                        }))
                    )
                )
                if (!attachmentsResult.success) {
                    captureActionError(attachmentsResult.error)
                    return {
                        success: false,
                        error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
                    }
                }
                const attachments = attachmentsResult.value

                const configResult = await tryCatch(getAssistanceConfig())
                if (!configResult.success) {
                    captureActionError(configResult.error)
                    return {
                        success: false,
                        error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
                    }
                }
                const config = configResult.value
                const situationLabel = SITUATIONS[data.situation].label
                const moyenContactLabel = MOYEN_CONTACT[data.moyenContact]

                const internal = await sendEmail({
                    to: config.recipientEmail,
                    subject: `Défense des droits — ${situationLabel} — ${data.prenom} ${data.nom}`,
                    html: await render(
                        <AssistanceTemplate
                            prenom={data.prenom}
                            nom={data.nom}
                            email={data.email}
                            etablissement={data.etablissement}
                            ufr={data.ufr}
                            situationLabel={situationLabel}
                            moyenContactLabel={moyenContactLabel}
                            telephone={data.telephone}
                            message={data.message}
                            hasAttachments={attachments.length > 0}
                        />
                    ),
                    attachments
                })

                if (!internal.success) {
                    return {
                        success: false,
                        error: "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
                    }
                }

                // Acknowledgement is best-effort: the request has already been sent.
                await sendEmail({
                    to: data.email,
                    subject:
                        "Votre demande de défense des droits a bien été reçue",
                    html: await render(
                        <AssistanceAck
                            situationLabel={situationLabel}
                            delay={config.delay}
                        />
                    )
                })

                return { success: true }
            }
        )
    )
