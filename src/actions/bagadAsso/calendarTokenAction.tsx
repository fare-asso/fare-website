import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type GenerateResult =
    | { success: true; value: string }
    | { success: false; error: string }

export const generateBagadCalendarTokenAction = createServerFn({
    method: "POST"
}).handler(
    withServerAction(
        "generateBagadCalendarTokenAction",
        async (): Promise<GenerateResult> => {
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

            const bytes = crypto.getRandomValues(new Uint8Array(32))
            const token = btoa(String.fromCharCode(...bytes))
                .replaceAll("+", "-")
                .replaceAll("/", "_")
                .replace(/=+$/, "")

            const result = await tryCatch(
                prisma.user.update({
                    where: { id: user.id },
                    data: { calendarToken: token }
                })
            )
            if (!result.success) {
                captureActionError(result.error)
                return {
                    success: false,
                    error: "Echec de la génération du lien"
                }
            }

            return { success: true, value: token }
        }
    )
)

type RevokeResult = { success: true } | { success: false; error: string }

export const revokeBagadCalendarTokenAction = createServerFn({
    method: "POST"
}).handler(
    withServerAction(
        "revokeBagadCalendarTokenAction",
        async (): Promise<RevokeResult> => {
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
                return {
                    success: false,
                    error: "Echec de la révocation du lien"
                }
            }

            return { success: true }
        }
    )
)
