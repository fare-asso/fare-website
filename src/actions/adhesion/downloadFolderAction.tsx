import type { ActionAPIContext } from "astro:actions"
import { zip } from "fflate"

import { generateAdhesionPdfFromRecord } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type ActionState =
    | { success: true; zipData: string; filename: string }
    | { success: false; error: string }

async function downloadFolderActionImpl(
    folderPath: string,
    context: ActionAPIContext
): Promise<ActionState> {
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

    if (!folderPath) {
        return { success: false, error: "Le nom du dossier est invalide" }
    }

    const adhesion = await tryCatch(
        prisma.adhesion.findFirst({ where: { folderPath } })
    )

    if (!adhesion.success) {
        captureActionError(adhesion.error)
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }

    if (!adhesion.value) {
        return {
            success: false,
            error: "Aucune adhésion ne correspond à ce dossier"
        }
    }

    const filePaths = [
        [adhesion.value.logoPath, "logo"],
        [adhesion.value.statutsPath, "statuts"],
        [adhesion.value.recepissePath, "recepisse"],
        [adhesion.value.extraitPVPath, "extrait-pv"],
        [adhesion.value.lettreEngagementPath, "lettre-engagement"],
        [adhesion.value.reglementInterieurPath, "reglement-interieur"],
        [adhesion.value.bilanFinancierPath, "bilan-financier"],
        ...adhesion.value.photosPaths.map((path, i) => [path, `photo-${i}`])
    ].filter((path): path is [string, string] => Boolean(path[0]))

    const supabase = createClient(context)

    // Téléchargement parallèle des fichiers référencés en base
    const downloads = await tryCatch(
        Promise.all(
            filePaths.map(async ([path, filename]) => {
                const { data, error } = await supabase.storage
                    .from("adhesion")
                    .download(path)
                if (error) throw error
                const fileExtension = path.split(".").pop()
                return {
                    name: `${filename}.${fileExtension}`,
                    data: new Uint8Array(await data.arrayBuffer())
                }
            })
        )
    )
    if (!downloads.success) {
        captureActionError(downloads.error)
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }

    console.log("Generating adhesion PDF")
    const pdf = await tryCatch(generateAdhesionPdfFromRecord(adhesion.value))
    if (!pdf.success) {
        console.error("Error generating adhesion PDF")
        captureActionError(pdf.error)
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }

    const entries: Record<string, Uint8Array> = {}
    for (const file of downloads.value) {
        entries[file.name] = file.data
    }
    entries["formulaire-adhesion.pdf"] = pdf.value

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
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }

    return {
        success: true,
        zipData: Buffer.from(zipBuffer.value).toString("base64"),
        filename: `${folderPath}.zip`
    }
}

export const downloadFolderAction = wrapAction(
    "downloadFolderAction",
    downloadFolderActionImpl
)
