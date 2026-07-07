import { createServerFn } from "@tanstack/react-start"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf.server"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type DownloadPdfResult = {
    success?: boolean
    error?: string
    pdfData?: string
    filename?: string
}

export const downloadAdhesionPdfAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "downloadAdhesionPdfAction",
            async ({ data: adhesionId }): Promise<DownloadPdfResult> => {
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

                const pdfResult = await tryCatch(
                    generateAdhesionPdfFromRecord(adhesion)
                )
                if (!pdfResult.success) {
                    captureActionError(pdfResult.error)
                    return { error: "Erreur lors de la génération du PDF" }
                }
                const slug =
                    sanitizeString(adhesion.sigle) || `adhesion-${adhesion.id}`

                return {
                    success: true,
                    pdfData: Buffer.from(pdfResult.value).toString("base64"),
                    filename: `formulaire-adhesion-${slug}.pdf`
                }
            }
        )
    )
