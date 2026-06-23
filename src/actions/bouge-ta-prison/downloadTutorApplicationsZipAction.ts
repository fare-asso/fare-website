"use server"

import { type } from "arktype"
import { format } from "date-fns"
import { zip } from "fflate"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    DownloadTutorApplicationsSchema,
    MAX_TUTOR_APPLICATIONS_DOWNLOAD,
    type TDownloadTutorApplications
} from "@/schemas/bougeTaPrison"

const BUCKET = "btp-tutor-application"

type DownloadResult =
    | { success: true; zipData: string; filename: string; missing: number }
    | { success: false; error: string }

function csvField(value: string): string {
    return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function statusLabel(app: {
    archived: Date | null
    approved: boolean
}): string {
    if (app.archived) return "Archivée"
    if (app.approved) return "Approuvée"
    return "En attente"
}

async function downloadTutorApplicationsZipActionImpl(
    ids: TDownloadTutorApplications
): Promise<DownloadResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:btp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const validIds = DownloadTutorApplicationsSchema(ids)
    if (validIds instanceof type.errors) {
        return {
            success: false,
            error: `Sélection invalide (entre 1 et ${MAX_TUTOR_APPLICATIONS_DOWNLOAD} candidatures).`
        }
    }

    const applications = await tryCatch(
        prisma.bTPTutorApplication.findMany({
            where: { id: { in: validIds } },
            orderBy: { createdAt: "desc" }
        })
    )
    if (!applications.success) {
        captureActionError(applications.error)
        return {
            success: false,
            error: "Erreur lors de la création du fichier zip"
        }
    }
    if (applications.value.length === 0) {
        return {
            success: false,
            error: "Aucune candidature ne correspond à la sélection"
        }
    }

    const supabase = await createClient()

    const downloaded = await Promise.all(
        applications.value.map(async (app) => {
            const folder = `${sanitizeString(app.lastName)}-${sanitizeString(
                app.firstName
            )}-${app.id}`
            const files = [
                { name: "cv.pdf", path: app.cvPath },
                { name: "lettre-de-motivation.pdf", path: app.mlPath }
            ]
            const data = await Promise.all(
                files.map(async (file) => {
                    const dl = await tryCatch(
                        supabase.storage.from(BUCKET).download(file.path)
                    )
                    if (!dl.success || !dl.value) {
                        return { name: file.name, bytes: null }
                    }
                    return {
                        name: file.name,
                        bytes: new Uint8Array(await dl.value.arrayBuffer())
                    }
                })
            )
            return { app, folder, data }
        })
    )

    const entries: Record<string, Uint8Array> = {}
    let missing = 0
    const csvRows = [
        [
            "id",
            "nom",
            "prénom",
            "email",
            "filière",
            "année",
            "statut",
            "date",
            "fichiers manquants"
        ]
            .map(csvField)
            .join(",")
    ]

    for (const { app, folder, data } of downloaded) {
        const missingForApp: string[] = []
        for (const file of data) {
            if (file.bytes === null) {
                missing++
                missingForApp.push(file.name)
                continue
            }
            entries[`${folder}/${file.name}`] = file.bytes
        }

        csvRows.push(
            [
                String(app.id),
                app.lastName,
                app.firstName,
                app.email,
                app.major,
                app.studyYear,
                statusLabel(app),
                format(app.createdAt, "yyyy-MM-dd"),
                missingForApp.join(" / ")
            ]
                .map(csvField)
                .join(",")
        )
    }

    entries["candidatures.csv"] = new TextEncoder().encode(
        `﻿${csvRows.join("\r\n")}`
    )

    const zipBuffer = await tryCatch(
        new Promise<Uint8Array>((resolve, reject) => {
            zip(entries, { level: 9 }, (err, output) => {
                if (err) reject(err)
                else resolve(output)
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
        filename: `candidatures-tutorat-${format(new Date(), "yyyy-MM-dd")}.zip`,
        missing
    }
}

export default withServerAction(
    "downloadTutorApplicationsZipAction",
    downloadTutorApplicationsZipActionImpl
)
