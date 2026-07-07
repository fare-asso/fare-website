import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"
import { format } from "date-fns"
import { zip } from "fflate"

import type { BTPTutorApplication } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { sanitizeString } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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
    // Neutralize spreadsheet formula triggers (CSV injection) — applicant
    // fields come from a public form — then quote/escape as usual.
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
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

    const supabase = createClient()

    const downloadApplication = async (app: BTPTutorApplication) => {
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
    }

    // Download in small batches so we never open ~150 concurrent storage
    // requests on a large selection (75 apps × 2 files).
    const DOWNLOAD_CONCURRENCY = 10
    const downloaded: Awaited<ReturnType<typeof downloadApplication>>[] = []
    for (let i = 0; i < applications.value.length; i += DOWNLOAD_CONCURRENCY) {
        const batch = applications.value.slice(i, i + DOWNLOAD_CONCURRENCY)
        // oxlint-disable-next-line no-await-in-loop -- sequential batches cap concurrency
        const results = await Promise.all(batch.map(downloadApplication))
        downloaded.push(...results)
    }

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

    // The whole archive is returned as base64 through the server action. The
    // 75-candidature cap (enforced by the schema) bounds memory/response size;
    // switch to a streamed Route Handler if individual PDFs grow large.
    return {
        success: true,
        zipData: Buffer.from(zipBuffer.value).toString("base64"),
        filename: `candidatures-tutorat-${format(new Date(), "yyyy-MM-dd")}.zip`,
        missing
    }
}

const downloadTutorApplicationsZipActionServerFn = createServerFn({
    method: "POST"
})
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof downloadTutorApplicationsZipActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "downloadTutorApplicationsZipAction",
            downloadTutorApplicationsZipActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof downloadTutorApplicationsZipActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof downloadTutorApplicationsZipActionImpl>
): ReturnType<typeof downloadTutorApplicationsZipActionImpl> =>
    downloadTutorApplicationsZipActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof downloadTutorApplicationsZipActionImpl>
