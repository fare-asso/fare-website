import type { ActionAPIContext } from "astro:actions"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function downloadAdhesionPdfActionImpl(
    adhesionId: number,
    context: ActionAPIContext
): Promise<
    | { success: true; pdfData: string; filename: string }
    | { success: false; error: string }
> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:adhesions")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const adhesionResult = await tryCatch(
        prisma.adhesion.findUnique({
            where: { id: adhesionId }
        })
    )
    if (!adhesionResult.success) {
        captureActionError(adhesionResult.error)
        return { success: false, error: "Erreur lors de la génération du PDF" }
    }
    const adhesion = adhesionResult.value

    if (!adhesion) {
        return { success: false, error: "Demande d'adhésion introuvable" }
    }

    const pdfResult = await tryCatch(generateAdhesionPdfFromRecord(adhesion))
    if (!pdfResult.success) {
        captureActionError(pdfResult.error)
        return { success: false, error: "Erreur lors de la génération du PDF" }
    }
    const slug = sanitizeString(adhesion.sigle) || `adhesion-${adhesion.id}`

    return {
        success: true,
        pdfData: Buffer.from(pdfResult.value).toString("base64"),
        filename: `formulaire-adhesion-${slug}.pdf`
    }
}

export const downloadAdhesionPdfAction = wrapAction(
    "downloadAdhesionPdfAction",
    downloadAdhesionPdfActionImpl
)
