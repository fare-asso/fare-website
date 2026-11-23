import type { ActionAPIContext } from "astro:actions"
import { zip } from "fflate"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { generateRemboursementPdfFromRecord } from "@/helpers/remboursement/generatePdf"
import {
    createAdminClient,
    getUserWithPermissions
} from "@/helpers/supabase/astro"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DownloadResult =
    | { success: true; zipData: string; filename: string }
    | { success: false; error: string }

export async function downloadRemboursementFolderAction(
    remboursementId: number,
    context?: ActionAPIContext
): Promise<DownloadResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "download:remboursement-folder")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const record = await tryCatch(
        prisma.remboursement.findUnique({ where: { id: remboursementId } })
    )
    if (!record.success) {
        captureActionError(record.error)
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }
    if (!record.value) {
        return {
            success: false,
            error: "Aucune demande de remboursement ne correspond à cet identifiant"
        }
    }

    const {
        folderPath,
        ribPath,
        justificatifsPaths,
        piecesMetroBusPaths,
        justificatifsPassagersPaths
    } = record.value

    const filePaths: [string, string][] = [
        [ribPath, "rib"],
        ...justificatifsPaths.map((path, i): [string, string] => [
            path,
            `justificatif-${i + 1}`
        ]),
        ...piecesMetroBusPaths.map((path, i): [string, string] => [
            path,
            `metro-bus-${i + 1}`
        ]),
        ...justificatifsPassagersPaths.map((path, i): [string, string] => [
            path,
            `passagers-${i + 1}`
        ])
    ].filter((entry): entry is [string, string] => Boolean(entry[0]))

    const supabase = createAdminClient()

    const downloads = await tryCatch(
        Promise.all(
            filePaths.map(async ([path, filename]) => {
                const { data, error } = await supabase.storage
                    .from("remboursement")
                    .download(path)
                if (error) throw error
                const ext = path.split(".").pop() ?? "bin"
                return {
                    name: `${filename}.${ext}`,
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

    const pdf = await tryCatch(generateRemboursementPdfFromRecord(record.value))
    if (!pdf.success) {
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
    entries["formulaire-remboursement.pdf"] = pdf.value

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
