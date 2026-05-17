"use server"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    try {
        const adhesion = await prisma.adhesion.findUnique({
            where: { id: adhesionId }
        })

        if (!adhesion) {
            return { error: "Demande d'adhésion introuvable" }
        }

        const pdf = await generateAdhesionPdfFromRecord(adhesion)
        const slug = sanitizeString(adhesion.sigle) || `adhesion-${adhesion.id}`

        return {
            success: true,
            pdfData: Buffer.from(pdf).toString("base64"),
            filename: `formulaire-adhesion-${slug}.pdf`
        }
    } catch (error) {
        captureActionError(error)
        return { error: "Erreur lors de la génération du PDF" }
    }
}

export default withServerAction(
    "downloadAdhesionPdfAction",
    downloadAdhesionPdfActionImpl
)
