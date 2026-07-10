import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const ConfigInput = type({
    recipientEmail: "string.email >= 1",
    delay: "string >= 1"
})

async function updateAssistanceConfigImpl(
    input: {
        recipientEmail: string
        delay: string
    },
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
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

export const updateAssistanceConfig = wrapAction(
    "updateAssistanceConfig",
    updateAssistanceConfigImpl
)
