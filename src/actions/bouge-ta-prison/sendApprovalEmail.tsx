import { createServerFn } from "@tanstack/react-start"
import { render } from "react-email"

import type { BTPTutorApplication } from "@/generated/prisma/client"
import prisma from "@/helpers/db.server"
import { sendEmail } from "@/helpers/email.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

import BtpApplicationAck from "../../../emails/btp-application-aknowledgement"

export const sendApprovalEmailAction = createServerFn({ method: "POST" })
    .validator((data: BTPTutorApplication) => data)
    .handler(
        withServerAction(
            "sendApprovalEmail",
            async ({
                data: application
            }): Promise<{ success: boolean; error: string | null }> => {
                console.log("Sending approval email to", application.email)

                const email = await sendEmail({
                    to: application.email,
                    subject:
                        "Bouge Ta Prison - Informations sur votre candidature",
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
        )
    )
