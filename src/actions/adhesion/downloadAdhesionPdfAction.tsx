"use server"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function downloadAdhesionPdfActionImpl(adhesionId: number): Promise<{
    success?: boolean
    error?: string
    pdfData?: string
    filename?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:adhesions")) {
        return {
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
        return { error: "Erreur lors de la génération du PDF" }
    }
    const adhesion = adhesionResult.value

    if (!adhesion) {
        return { error: "Demande d'adhésion introuvable" }
    }

    const pdfResult = await tryCatch(generateAdhesionPdfFromRecord(adhesion))
    if (!pdfResult.success) {
        captureActionError(pdfResult.error)
        return { error: "Erreur lors de la génération du PDF" }
    }
    const slug = sanitizeString(adhesion.sigle) || `adhesion-${adhesion.id}`

    return {
        success: true,
        pdfData: Buffer.from(pdfResult.value).toString("base64"),
        filename: `formulaire-adhesion-${slug}.pdf`
    }
}

export default withServerAction(
    "downloadAdhesionPdfAction",
    downloadAdhesionPdfActionImpl
)
