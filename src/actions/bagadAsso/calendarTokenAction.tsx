import { randomBytes } from "node:crypto"

import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type GenerateResult =
    | { success: true; value: string }
    | { success: false; error: string }

async function generateBagadCalendarTokenActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<GenerateResult> {
    const user = await getUserWithPermissions(context)
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

    return { success: true, value: token }
}

type RevokeResult = { success: true } | { success: false; error: string }

async function revokeBagadCalendarTokenActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<RevokeResult> {
    const user = await getUserWithPermissions(context)
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

    return { success: true }
}

export const generateBagadCalendarTokenAction = wrapAction(
    "generateBagadCalendarTokenAction",
    generateBagadCalendarTokenActionImpl
)

export const revokeBagadCalendarTokenAction = wrapAction(
    "revokeBagadCalendarTokenAction",
    revokeBagadCalendarTokenActionImpl
)
