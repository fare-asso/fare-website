import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"
import { createRequestLogger } from "evlog"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import { RemboursementTemplate } from "@/../emails/remboursement"
import { RemboursementAck } from "@/../emails/remboursement-acknowledgement"
import { verifyCaptcha } from "@/helpers/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createAdminClient } from "@/helpers/supabase/astro"
import type { ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    RemboursementFormSchema,
    type TRemboursementForm
} from "@/schemas/remboursement"

const BUCKET = "remboursement"
const TRESORERIE_EMAIL = "tresorerie@fare-asso.fr"

const extensionByMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf"
}

export async function processRemboursement(
    data: TRemboursementForm,
    context?: ActionAPIContext
): Promise<ActionResult> {
    const log = context?.locals.log ?? createRequestLogger()
    const parsed = RemboursementFormSchema(data)

    if (parsed instanceof type.errors) {
        log.set({
            failureReason: "validation",
            validationError: parsed.summary
        })
        return { success: false, error: parsed.summary }
    }

    log.set({
        demandeur: parsed.demandeur,
        type: parsed.type,
        justificatifsCount: parsed.justificatifs.length,
        piecesMetroBusCount: parsed.piecesMetroBus?.length ?? 0,
        justificatifsPassagersCount: parsed.justificatifsPassagers?.length ?? 0
    })

    if (!isDevelopment) {
        const isCaptchaValid = await verifyCaptcha(parsed.captchaToken)
        if (!isCaptchaValid) {
            log.set({ failureReason: "captcha" })
            return {
                success: false,
                error: "La vérification du captcha a échoué. Veuillez réessayer."
            }
        }
    }

    const folder = `${sanitizeString(`${parsed.prenom}-${parsed.nom}`)}-${crypto.randomUUID()}`
    log.set({ folder })
    const supabase = createAdminClient()
    const uploaded: string[] = []

    const cleanup = async (): Promise<void> => {
        if (uploaded.length > 0) {
            const { error: removeError } = await supabase.storage
                .from(BUCKET)
                .remove(uploaded)
            if (removeError) {
                log.set({ cleanupError: removeError.message })
            }
        }
    }

    const uploadFile = async (
        name: string,
        file: File
    ): Promise<string | null> => {
        const ext = extensionByMime[file.type]
        if (!ext) {
            log.set({
                failureReason: "unsupported_mime",
                fileName: name,
                mimeType: file.type
            })
            return null
        }
        const path = `${folder}/${name}.${ext}`
        const { data: result, error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file)
        if (error || !result) {
            log.set({
                failureReason: "storage_upload",
                bucket: BUCKET,
                uploadPath: path,
                storageError: error?.message ?? "No upload result"
            })
            if (error) {
                log.error(
                    error instanceof Error ? error : new Error(String(error))
                )
            }
            return null
        }
        uploaded.push(result.path)
        return result.path
    }

    const uploadGroup = async (
        prefix: string,
        files: File[] = []
    ): Promise<string[] | null> => {
        const results = await Promise.all(
            files.map((file, i) => uploadFile(`${prefix}-${i + 1}`, file))
        )
        if (results.some((path) => !path)) return null
        return results.filter((path): path is string => !!path)
    }

    const isDeplacement =
        parsed.type === "train" ||
        parsed.type === "voiture" ||
        parsed.type === "car"
    const hasMetroBus = parsed.type === "train" || parsed.type === "voiture"

    const ribPath = await uploadFile("rib", parsed.rib)
    const justificatifsPaths = ribPath
        ? await uploadGroup("justificatif", parsed.justificatifs)
        : null
    const piecesMetroBusPaths = justificatifsPaths
        ? await uploadGroup(
              "metro-bus",
              hasMetroBus ? parsed.piecesMetroBus : []
          )
        : null
    const justificatifsPassagersPaths = piecesMetroBusPaths
        ? await uploadGroup(
              "passagers",
              parsed.type === "voiture" ? parsed.justificatifsPassagers : []
          )
        : null

    if (
        !ribPath ||
        !justificatifsPaths ||
        !piecesMetroBusPaths ||
        !justificatifsPassagersPaths
    ) {
        await cleanup()
        return {
            success: false,
            error: "Échec de l'envoi des fichiers. Veuillez réessayer plus tard."
        }
    }

    const association =
        parsed.demandeur === "adminFARE" ? (parsed.association ?? null) : null

    const created = await tryCatch(
        prisma.remboursement.create({
            data: {
                demandeur: parsed.demandeur,
                association,
                prenom: parsed.prenom,
                nom: parsed.nom,
                email: parsed.email,
                telephone: parsed.telephone,
                type: parsed.type,
                dateVoyage: isDeplacement ? (parsed.dateVoyage ?? null) : null,
                depart: isDeplacement ? (parsed.depart ?? null) : null,
                arrivee: isDeplacement ? (parsed.arrivee ?? null) : null,
                personnes:
                    parsed.type === "voiture"
                        ? (parsed.personnes ?? null)
                        : null,
                objet: parsed.type === "achat" ? (parsed.objet ?? null) : null,
                montantTTC:
                    parsed.type === "achat"
                        ? (parsed.montantTTC ?? null)
                        : null,
                folderPath: folder,
                ribPath,
                justificatifsPaths,
                piecesMetroBusPaths,
                justificatifsPassagersPaths
            }
        })
    )
    if (!created.success) {
        log.set({
            failureReason: "db_create",
            dbError:
                created.error instanceof Error
                    ? created.error.message
                    : String(created.error)
        })
        log.error(
            created.error instanceof Error
                ? created.error
                : new Error(String(created.error))
        )
        captureActionError(created.error)
        await cleanup()
        return {
            success: false,
            error: "Échec de l'enregistrement de la demande. Veuillez réessayer."
        }
    }

    log.set({ remboursementId: created.value.id })

    // Emails are best-effort: the request has already been persisted.
    const internalEmail = await sendEmail({
        to: TRESORERIE_EMAIL,
        replyTo: parsed.email,
        subject: `Demande de remboursement — ${parsed.prenom} ${parsed.nom}`,
        html: await render(
            <RemboursementTemplate
                prenom={parsed.prenom}
                nom={parsed.nom}
                email={parsed.email}
                demandeur={parsed.demandeur}
                association={association ?? undefined}
                type={parsed.type}
            />
        )
    })

    const ackEmail = await sendEmail({
        to: parsed.email,
        subject: "Votre demande de remboursement a bien été reçue",
        html: await render(
            <RemboursementAck prenom={parsed.prenom} type={parsed.type} />
        )
    })

    log.set({
        internalEmailSent: internalEmail.success,
        ackEmailSent: ackEmail.success
    })

    return { success: true }
}
