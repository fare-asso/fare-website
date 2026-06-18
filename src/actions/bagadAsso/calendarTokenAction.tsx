"use server"

import { randomBytes } from "node:crypto"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type GenerateResult =
    | { success: true; value: string }
    | { success: false; error: string }

async function generateBagadCalendarTokenActionImpl(): Promise<GenerateResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:bagad-asso")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const token = randomBytes(32).toString("base64url")

    const result = await tryCatch(
        prisma.user.update({
            where: { id: user.id },
            data: { calendarToken: token }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false, error: "Echec de la génération du lien" }
    }

    revalidatePath("/dashboard/bagadAsso")

    return { success: true, value: token }
}

type RevokeResult = { success: true } | { success: false; error: string }

async function revokeBagadCalendarTokenActionImpl(): Promise<RevokeResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:bagad-asso")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.user.update({
            where: { id: user.id },
            data: { calendarToken: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false, error: "Echec de la révocation du lien" }
    }

    revalidatePath("/dashboard/bagadAsso")

    return { success: true }
}

export const generateBagadCalendarTokenAction = withServerAction(
    "generateBagadCalendarTokenAction",
    generateBagadCalendarTokenActionImpl
)

export const revokeBagadCalendarTokenAction = withServerAction(
    "revokeBagadCalendarTokenAction",
    revokeBagadCalendarTokenActionImpl
)
