import { createServerFn } from "@tanstack/react-start"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf.server"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

const downloadAdhesionPdfActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof downloadAdhesionPdfActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "downloadAdhesionPdfAction",
            downloadAdhesionPdfActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof downloadAdhesionPdfActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof downloadAdhesionPdfActionImpl>
): ReturnType<typeof downloadAdhesionPdfActionImpl> =>
    downloadAdhesionPdfActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof downloadAdhesionPdfActionImpl>
