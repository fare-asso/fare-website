import { createServerFn } from "@tanstack/react-start"
import { render } from "react-email"

import type { BTPTutorApplication } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

import BtpApplicationAck from "../../../emails/btp-application-aknowledgement"

async function sendApprovalEmailImpl(
    application: BTPTutorApplication
): Promise<{
    success: boolean
    error: string | null
}> {
    console.log("Sending approval email to", application.email)

    const email = await sendEmail({
        to: application.email,
        subject: "Bouge Ta Prison - Informations sur votre candidature",
        html: await render(
            <BtpApplicationAck
                firstName={application.firstName}
                lastName={application.lastName}
                email={application.email}
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
            where: {
                id: application.id
            },
            data: {
                approved: true
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Echec de la mise à jour de la candidature"
        }
    }

    return {
        success: true,
        error: null
    }
}

const sendApprovalEmailServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof sendApprovalEmailImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "sendApprovalEmail",
            sendApprovalEmailImpl
        )(...unpackActionArgs<Parameters<typeof sendApprovalEmailImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof sendApprovalEmailImpl>
): ReturnType<typeof sendApprovalEmailImpl> =>
    sendApprovalEmailServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof sendApprovalEmailImpl>
