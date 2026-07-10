import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { AssistanceTemplate } from "@/../emails/assistance"
import AssistanceAck from "@/../emails/assistance-acknowledgement"
import { getAssistanceConfig } from "@/helpers/assistanceConfig"
import { verifyCaptcha } from "@/helpers/captcha/verify"
import { sendEmail } from "@/helpers/email"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    AssistanceFormSchema,
    MOYEN_CONTACT,
    SITUATIONS,
    type TAssistanceForm
} from "@/schemas/assistance"

const MAX_FILE_SIZE = 2 * 1024 * 1024

async function processAssistanceImpl(
    formData: TAssistanceForm
): Promise<ActionResult> {
    const data = AssistanceFormSchema(formData)

    if (data instanceof type.errors) {
        return { success: false, error: data.summary }
    }

    if (!isDevelopment) {
        const isCaptchaValid = await verifyCaptcha(data.captchaToken)
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
        subject: "Votre demande de défense des droits a bien été reçue",
        html: await render(
            <AssistanceAck
                situationLabel={situationLabel}
                delay={config.delay}
            />
        )
    })

    return { success: true }
}

export const processAssistance = wrapAction(
    "processAssistance",
    processAssistanceImpl
)
