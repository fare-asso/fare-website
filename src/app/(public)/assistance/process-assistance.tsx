"use server"

import { render } from "@react-email/render"
import { type } from "arktype"
import { isDevelopment } from "std-env"
import { AssistanceTemplate } from "@/../emails/assistance"
import AssistanceAck from "@/../emails/assistance-acknowledgement"
import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import {
    AssistanceFormSchema,
    MOYEN_CONTACT,
    SITUATIONS,
    type TAssistanceForm
} from "./form-schema"

const MAX_FILE_SIZE = 2 * 1024 * 1024

type Result = { success: true } | { success: false; message: string }

async function getConfig(): Promise<{ recipientEmail: string; delay: string }> {
    const existing = await prisma.assistanceConfig.findFirst()
    if (existing) {
        return {
            recipientEmail: existing.recipientEmail,
            delay: existing.delay
        }
    }
    const created = await prisma.assistanceConfig.create({ data: {} })
    return { recipientEmail: created.recipientEmail, delay: created.delay }
}

export async function processAssistance(
    formData: TAssistanceForm
): Promise<Result> {
    const data = AssistanceFormSchema(formData)

    if (data instanceof type.errors) {
        return { success: false, message: data.summary }
    }

    if (!isDevelopment) {
        const isCaptchaValid = await verifyCaptcha(data.captchaToken)
        if (!isCaptchaValid) {
            return {
                success: false,
                message:
                    "La vérification du captcha a échoué. Veuillez réessayer."
            }
        }
    }

    const pieces = (data.pieces ?? []).filter(
        (file): file is File => file instanceof File
    )
    if (pieces.length > 3) {
        return {
            success: false,
            message: "Vous ne pouvez pas joindre plus de 3 fichiers."
        }
    }
    if (pieces.some((file) => file.size > MAX_FILE_SIZE)) {
        return {
            success: false,
            message: "Chaque fichier doit faire moins de 2 Mo."
        }
    }

    const attachments = await Promise.all(
        pieces.map(async (file) => ({
            filename: file.name,
            content: Buffer.from(await file.arrayBuffer()),
            contentType: file.type
        }))
    )

    const config = await getConfig()
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

    if (internal.error) {
        return {
            success: false,
            message:
                "Échec de l'envoi de votre demande. Veuillez réessayer plus tard."
        }
    }

    // Acknowledgement is best-effort: the request has already been sent.
    try {
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
    } catch (e) {
        console.error("Failed to send assistance acknowledgement", e)
    }

    return { success: true }
}
