import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditEluSchema, type TEditElu } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

async function editEluActionImpl(
    input: TEditElu,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des élu·e·s"
        }
    }

    const data = EditEluSchema(input)
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
            error: "Échec de la modification de l'élu·e."
        }
    }
    if (conseil.value === null) {
        return { success: false, error: "Conseil introuvable." }
    }

    const updated = await tryCatch(
        prisma.elu.update({
            where: { id: data.id },
            data: {
                name: data.name,
                position: data.position,
                description: data.description ?? null,
                conseilId: data.conseilId
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: "Échec de la modification de l'élu·e."
        }
    }

    return { success: true }
}

export const editEluAction = wrapAction("editEluAction", editEluActionImpl)
