import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AddConseilSchema, type TAddConseil } from "@/schemas/conseil"

type Result = { success: true } | { success: false; error: string }

export const addConseilAction = createServerFn({ method: "POST" })
    .validator((data: TAddConseil) => data)
    .handler(
        withServerAction(
            "addConseilAction",
            async ({ data: input }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return {
                        success: false,
                        error: "Authentification requise"
                    }
                }
                if (!hasPermission(user, "create:instance")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de créer des conseils"
                    }
                }

                const data = AddConseilSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const instance = await tryCatch(
                    prisma.instance.findUnique({
                        where: { id: data.instanceId },
                        select: { id: true }
                    })
                )
                if (!instance.success) {
                    captureActionError(instance.error)
                    return {
                        success: false,
                        error: "Échec de la création du conseil."
                    }
                }
                if (instance.value === null) {
                    return {
                        success: false,
                        error: "Instance introuvable."
                    }
                }

                const created = await tryCatch(
                    prisma.conseil.create({
                        data: {
                            name: data.name,
                            description: data.description ?? null,
                            instanceId: data.instanceId
                        }
                    })
                )
                if (!created.success) {
                    captureActionError(created.error)
                    return {
                        success: false,
                        error: "Échec de la création du conseil."
                    }
                }

                return { success: true }
            }
        )
    )
