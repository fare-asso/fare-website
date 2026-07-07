import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

const ConfigInput = type({
    recipientEmail: "string.email >= 1",
    delay: "string >= 1"
})

type Result = { success: true } | { success: false; error: string }

export const updateAssistanceConfig = createServerFn({ method: "POST" })
    .validator((data: { recipientEmail: string; delay: string }) => data)
    .handler(
        withServerAction(
            "updateAssistanceConfig",
            async ({ data: input }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return {
                        success: false,
                        error: "Authentification requise"
                    }
                }
                if (!hasPermission(user, "access:defense-droits")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier cette configuration"
                    }
                }

                const data = ConfigInput(input)
                if (data instanceof type.errors) {
                    return { success: false, error: data.summary }
                }

                const existingResult = await tryCatch(
                    prisma.assistanceConfig.findFirst()
                )
                if (!existingResult.success) {
                    captureActionError(existingResult.error)
                    return {
                        success: false,
                        error: "Échec de l'enregistrement de la configuration."
                    }
                }
                const existing = existingResult.value

                const upserted = existing
                    ? await tryCatch(
                          prisma.assistanceConfig.update({
                              where: { id: existing.id },
                              data: {
                                  recipientEmail: data.recipientEmail,
                                  delay: data.delay
                              }
                          })
                      )
                    : await tryCatch(
                          prisma.assistanceConfig.create({
                              data: {
                                  recipientEmail: data.recipientEmail,
                                  delay: data.delay
                              }
                          })
                      )
                if (!upserted.success) {
                    captureActionError(upserted.error)
                    return {
                        success: false,
                        error: "Échec de l'enregistrement de la configuration."
                    }
                }

                return { success: true }
            }
        )
    )
