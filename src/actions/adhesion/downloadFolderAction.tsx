import { createServerFn } from "@tanstack/react-start"
import { zip } from "fflate"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf.server"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type ActionState = {
    error?: string
    success?: boolean
    zipData?: string
    filename?: string
}

async function downloadFolderActionImpl(
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
        adhesion.value.bilanFinancierPath,
        ...adhesion.value.photosPaths
    ].filter((path): path is string => Boolean(path))

    const supabase = createClient()

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

const downloadFolderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof downloadFolderActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "downloadFolderAction",
            downloadFolderActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof downloadFolderActionImpl>>(
                data
            )
        )
    )

export const downloadFolderAction = async (
    ...args: Parameters<typeof downloadFolderActionImpl>
): ReturnType<typeof downloadFolderActionImpl> =>
    downloadFolderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof downloadFolderActionImpl>
