import { randomBytes } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

    return { success: true }
}

const generateBagadCalendarTokenActionServerFn = createServerFn({
    method: "POST"
})
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof generateBagadCalendarTokenActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "generateBagadCalendarTokenAction",
            generateBagadCalendarTokenActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof generateBagadCalendarTokenActionImpl>
            >(data)
        )
    )

export const generateBagadCalendarTokenAction = async (
    ...args: Parameters<typeof generateBagadCalendarTokenActionImpl>
): ReturnType<typeof generateBagadCalendarTokenActionImpl> =>
    generateBagadCalendarTokenActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof generateBagadCalendarTokenActionImpl>

const revokeBagadCalendarTokenActionServerFn = createServerFn({
    method: "POST"
})
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof revokeBagadCalendarTokenActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "revokeBagadCalendarTokenAction",
            revokeBagadCalendarTokenActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof revokeBagadCalendarTokenActionImpl>
            >(data)
        )
    )

export const revokeBagadCalendarTokenAction = async (
    ...args: Parameters<typeof revokeBagadCalendarTokenActionImpl>
): ReturnType<typeof revokeBagadCalendarTokenActionImpl> =>
    revokeBagadCalendarTokenActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof revokeBagadCalendarTokenActionImpl>
