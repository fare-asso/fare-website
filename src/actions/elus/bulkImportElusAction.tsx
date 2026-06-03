"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { withServerAction, captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { BulkImportEluSchema, type TBulkImportElu } from "@/schemas/elu"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkImportElusActionImpl(
    input: TBulkImportElu
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentication requise" }
    }
    if (!hasPermission(user, "create:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des éluEs"
        }
    }

    const data = BulkImportEluSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    const conseil = await tryCatch(
        prisma.conseil.findUnique({
            where: { id: data.conseilId },
            select: { id: true }
        })
    )

    if (!conseil.success) {
        captureActionError(
            new Error("Erreur lors de la recherche du conseil", {
                cause: conseil.error
            })
        )
        return { success: false, error: "Échec de l'import des éluEs" }
    }

    if (conseil.value == null) {
        return { success: false, error: "Conseil non trouvé" }
    }

    const maxOrder = await tryCatch(
        prisma.elu.aggregate({
            // Parmi les élus, on récupère le plus grand numéro d'ordre pour coller les nouveaux élus à la suite
            where: { conseilId: data.conseilId },
            _max: { order: true }
        })
    )

    if (!maxOrder.success) {
        captureActionError(
            new Error("Erreur lors de la recherche du dernier élu", {
                cause: maxOrder.error
            })
        )
        return {
            success: false,
            error: "Erreur lors de la recherche du dernier élu"
        }
    }
    const startOrder = (maxOrder.value._max.order ?? -1) + 1

    const created = await tryCatch(
        prisma.elu.createMany({
            data: data.elus.map((elu, index) => ({
                name: elu.name,
                position: elu.position,
                description: elu.description ?? null,
                conseilId: data.conseilId,
                order: startOrder + index
            }))
        })
    )

    if (!created.success) {
        captureActionError(
            new Error("Erreur lors de la création des élus", {
                cause: created.error
            })
        )
        return { success: false, error: "Erreur lors de la création des élus" }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true, value: { count: created.value.count } }
}

export default withServerAction(
    "bulkImportElusAction",
    bulkImportElusActionImpl
)
