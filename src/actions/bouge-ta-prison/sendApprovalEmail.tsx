"use server"

import type { BTPTutorApplication } from "@prisma/client"
import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { captureActionError, withServerAction } from "@/lib/sentry"
import BtpApplicationAck from "../../../emails/btp-application-aknowledgement"

async function sendApprovalEmailImpl(
    application: BTPTutorApplication
): Promise<{
    success: boolean
    error: string | null
}> {
    console.log("Sending approval email to", application.email)

    try {
        const { success } = await sendEmail({
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

        if (!success) {
            return {
                success: false,
                error: " L'email n'a pas pu être envoyé. Veuillez réessayer plus tard."
            }
        }
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "L'email n'a pas pu être envoyé. Veuillez réessayer plus tard."
        }
    }

    try {
        await prisma.bTPTutorApplication.update({
            where: {
                id: application.id
            },
            data: {
                approved: true
            }
        })
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "Echec de la mise à jour de la candidature"
        }
    }

    revalidatePath("/dashboard/bouge-ta-prison/candidatures-tutorat/18")
    revalidatePath("/dashboard/bouge-ta-prison")
    return {
        success: true,
        error: null
    }
}

export default withServerAction("sendApprovalEmail", sendApprovalEmailImpl)
