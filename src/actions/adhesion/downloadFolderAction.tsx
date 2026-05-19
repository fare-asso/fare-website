"use server"

import { zip } from "fflate"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type ActionState = {
    error?: string
    success?: boolean
    zipData?: string
    filename?: string
}

async function downloadFolderActionImpl(
    _prevState: ActionState | undefined,
    folderPath: string
): Promise<ActionState> {
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

    if (!folderPath) {
        return { error: "Le nom du dossier est invalide" }
    }

    const adhesion = await tryCatch(
        prisma.adhesion.findFirst({ where: { folderPath } })
    )

    if (!adhesion.success) {
        captureActionError(adhesion.error)
        return { error: "Erreur lors de la création du fichier zip" }
    }

    if (!adhesion.value) {
        return { error: "Aucune adhésion ne correspond à ce dossier" }
    }

    const filePaths = [
        adhesion.value.logoPath,
        adhesion.value.statutsPath,
        adhesion.value.recepissePath,
        adhesion.value.extraitPVPath,
        adhesion.value.lettreEngagementPath,
        adhesion.value.reglementInterieurPath,
        adhesion.value.bilanFinancierPath
    ].filter((path): path is string => Boolean(path))

    const supabase = await createClient()

    // Téléchargement parallèle des fichiers référencés en base
    const downloads = await tryCatch(
        Promise.all(
            filePaths.map(async (path) => {
                const { data, error } = await supabase.storage
                    .from("adhesion")
                    .download(path)
                if (error) throw error
                const name = path.split("/").pop() ?? path
                return { name, data: new Uint8Array(await data.arrayBuffer()) }
            })
        )
    )
    if (!downloads.success) {
        captureActionError(downloads.error)
        return { error: "Erreur lors de la création du fichier zip" }
    }

    console.log("Generating adhesion PDF")
    const pdf = await tryCatch(generateAdhesionPdfFromRecord(adhesion.value))
    if (!pdf.success) {
        console.error("Error generating adhesion PDF")
        captureActionError(pdf.error)
        return { error: "Erreur lors de la création du fichier zip" }
    }

    const entries: Record<string, Uint8Array> = {}
    for (const file of downloads.value) {
        entries[file.name] = file.data
    }
    const slug =
        sanitizeString(adhesion.value.sigle) || `adhesion-${adhesion.value.id}`
    entries[`formulaire-adhesion-${slug}.pdf`] = pdf.value

    const zipBuffer = await tryCatch(
        new Promise<Uint8Array>((resolve, reject) => {
            zip(entries, { level: 9 }, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    )
    if (!zipBuffer.success) {
        captureActionError(zipBuffer.error)
        return { error: "Erreur lors de la création du fichier zip" }
    }

    return {
        success: true,
        zipData: Buffer.from(zipBuffer.value).toString("base64"),
        filename: `${folderPath}.zip`
    }
}

export const downloadFolderAction = withServerAction(
    "downloadFolderAction",
    downloadFolderActionImpl
)
