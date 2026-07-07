import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const ConfigInput = type({
    recipientEmail: "string.email >= 1",
    delay: "string >= 1"
})

type Result = { success: true } | { success: false; error: string }

async function updateAssistanceConfigImpl(input: {
    recipientEmail: string
    delay: string
}): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
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

    const existingResult = await tryCatch(prisma.assistanceConfig.findFirst())
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

const updateAssistanceConfigServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof updateAssistanceConfigImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateAssistanceConfig",
            updateAssistanceConfigImpl
        )(
            ...unpackActionArgs<Parameters<typeof updateAssistanceConfigImpl>>(
                data
            )
        )
    )

export const updateAssistanceConfig = async (
    ...args: Parameters<typeof updateAssistanceConfigImpl>
): ReturnType<typeof updateAssistanceConfigImpl> =>
    updateAssistanceConfigServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateAssistanceConfigImpl>
