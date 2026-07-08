import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddEluSchema, type TAddElu } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

async function addEluActionImpl(
    input: TAddElu,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des élu·e·s"
        }
    }

    const data = AddEluSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const conseil = await tryCatch(
        prisma.conseil.findUnique({
            where: { id: data.conseilId },
            select: { id: true }
        })
    )
    if (!conseil.success) {
        captureActionError(conseil.error)
        return {
            success: false,
            error: "Échec de la création de l'élu·e."
        }
    }
    if (conseil.value === null) {
        return { success: false, error: "Conseil introuvable." }
    }

    const created = await tryCatch(
        prisma.elu.create({
            data: {
                name: data.name,
                position: data.position,
                description: data.description ?? null,
                conseilId: data.conseilId
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Échec de la création de l'élu·e."
        }
    }

    return { success: true }
}

export const addEluAction = wrapAction("addEluAction", addEluActionImpl)
