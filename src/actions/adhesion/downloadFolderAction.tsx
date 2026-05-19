"use server"

import archiver from "archiver"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

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

    const supabase = await createClient()

    if (!folderPath) {
        return { error: "Le nom du dossier est invalide" }
    }

    try {
        const { data: files, error } = await supabase.storage
            .from("adhesion")
            .list(folderPath)

        if (error) throw error

        const archive = archiver("zip", { zlib: { level: 9 } })
        const chunks: Uint8Array[] = []

        archive.on("data", (chunk: Uint8Array) => chunks.push(chunk))
        archive.on("warning", (err: Error) => console.warn(err))
        archive.on("error", (err: Error) => {
            throw err
        })

        // Téléchargement parallèle des fichiers
        const downloadPromises = files.map(async (file) => {
            const { data: fileData, error: fileError } = await supabase.storage
                .from("adhesion")
                .download(`${folderPath}/${file.name}`)

            if (fileError) throw fileError

            return { name: file.name, data: await fileData.arrayBuffer() }
        })

        const downloadedFiles = await Promise.all(downloadPromises)

        // Ajout des fichiers à l'archive
        for (const file of downloadedFiles) {
            archive.append(Buffer.from(file.data), { name: file.name })
        }

        // Le formulaire PDF n'est plus stocké : on le régénère depuis la
        // base de données et on l'ajoute au zip.
        const adhesion = await prisma.adhesion.findFirst({
            where: { folderPath }
        })
        if (adhesion) {
            const pdf = await generateAdhesionPdfFromRecord(adhesion)
            const slug =
                sanitizeString(adhesion.sigle) || `adhesion-${adhesion.id}`
            archive.append(Buffer.from(pdf), {
                name: `formulaire-adhesion-${slug}.pdf`
            })
        }

        await archive.finalize()

        const zipBuffer = Buffer.concat(chunks)
        const base64Zip = zipBuffer.toString("base64")

        return {
            success: true,
            zipData: base64Zip,
            filename: `${folderPath}.zip`
        }
    } catch (error) {
        captureActionError(error)
        return { error: "Erreur lors de la création du fichier zip" }
    }
}

export const downloadFolderAction = withServerAction(
    "downloadFolderAction",
    downloadFolderActionImpl
)
