"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
        const existing = await prisma.assistanceConfig.findFirst()
        if (existing) {
            await prisma.assistanceConfig.update({
                where: { id: existing.id },
                data: {
                    recipientEmail: data.recipientEmail,
                    delay: data.delay
                }
            })
        } else {
            await prisma.assistanceConfig.create({
                data: {
                    recipientEmail: data.recipientEmail,
                    delay: data.delay
                }
            })
        }
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "Échec de l'enregistrement de la configuration."
        }
    }

    revalidatePath("/dashboard/defense-des-droits")
    return { success: true }
}

export const updateAssistanceConfig = withServerAction(
    "updateAssistanceConfig",
    updateAssistanceConfigImpl
)
