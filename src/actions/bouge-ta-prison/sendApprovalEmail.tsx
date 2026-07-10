import type { ActionAPIContext } from "astro:actions"
import { render } from "react-email"

import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

import BtpApplicationAck from "../../../emails/btp-application-aknowledgement"

async function sendApprovalEmailImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:btp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const application = await tryCatch(
        prisma.bTPTutorApplication.findUnique({ where: { id } })
    )
    if (!application.success) {
        captureActionError(application.error)
        return { success: false, error: "Candidature introuvable" }
    }
    if (!application.value) {
        return { success: false, error: "Candidature introuvable" }
    }

    const email = await sendEmail({
        to: application.value.email,
        subject: "Bouge Ta Prison - Informations sur votre candidature",
        html: await render(
            <BtpApplicationAck
                firstName={application.value.firstName}
                lastName={application.value.lastName}
                email={application.value.email}
            />
        )
    })

    if (!email.success) {
        return {
            success: false,
            error: "L'email n'a pas pu être envoyé. Veuillez réessayer plus tard."
        }
    }

    const updated = await tryCatch(
        prisma.bTPTutorApplication.update({
            where: { id },
            data: { approved: true }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Echec de la mise à jour de la candidature"
        }
    }

    return { success: true }
}

export const sendApprovalEmail = wrapAction(
    "sendApprovalEmail",
    sendApprovalEmailImpl
)
