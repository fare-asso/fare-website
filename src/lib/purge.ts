import prisma from "@/helpers/db"
import { createAdminClient } from "@/helpers/supabase/astro"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const BTP_BUCKET = "btp-tutor-application"
const ADHESION_BUCKET = "adhesion"

export interface PurgeSummary {
    /** BTP questions deleted */
    btpQuestions: number
    /** BTP applications anonymised */
    btpApplications: number
    /** Bagad'Asso tickets anonymised */
    bagadTickets: number
    /** Adhesion dossiers deleted */
    adhesions: number
}

type AdminClient = ReturnType<typeof createAdminClient>

function yearsAgo(years: number): Date {
    const d = new Date()
    d.setFullYear(d.getFullYear() - years)
    return d
}

/** Delete storage objects best-effort; log failures without throwing. */
async function removeFiles(
    supabase: AdminClient,
    bucket: string,
    paths: string[]
): Promise<void> {
    if (paths.length === 0) return
    const res = await tryCatch(supabase.storage.from(bucket).remove(paths))
    if (!res.success) captureActionError(res.error)
}

/** BTP questions: kept 1 year from submission, then deleted. Base only. */
async function purgeBtpQuestions(): Promise<number> {
    const res = await tryCatch(
        prisma.bTPTutorQuestion.deleteMany({
            where: { createdAt: { lt: yearsAgo(1) } }
        })
    )
    if (!res.success) {
        captureActionError(res.error)
        return 0
    }
    return res.value.count
}

/**
 * Bagad'Asso tickets: 2 years after the event we strip identifying data (referent
 * name, position, phone, emails, event address) and keep the anonymous stats
 * (association, event type/date, participants, equipment). `firstName != ""`
 * skips already-anonymised rows.
 */
async function anonymiseBagadTickets(): Promise<number> {
    const res = await tryCatch(
        prisma.bagadAssoTicket.updateMany({
            where: { eventDate: { lt: yearsAgo(2) }, firstName: { not: "" } },
            data: {
                firstName: "",
                lastName: "",
                position: "",
                phoneNumber: null,
                associationEmail: "",
                representativeEmail: "",
                eventAddr: ""
            }
        })
    )
    if (!res.success) {
        captureActionError(res.error)
        return 0
    }
    return res.value.count
}

/**
 * BTP applications: 2 years after submission we remove the CV + motivation letter
 * from storage and strip identifying data (name, email, file paths), keeping the
 * anonymous stats (major, study year, date). `cvPath != ""` skips done rows.
 */
async function anonymiseBtpApplications(
    supabase: AdminClient
): Promise<number> {
    const expired = await tryCatch(
        prisma.bTPTutorApplication.findMany({
            where: { createdAt: { lt: yearsAgo(2) }, cvPath: { not: "" } },
            select: { id: true, cvPath: true, mlPath: true }
        })
    )
    if (!expired.success) {
        captureActionError(expired.error)
        return 0
    }
    if (expired.value.length === 0) return 0

    const paths = expired.value
        .flatMap((r) => [r.cvPath, r.mlPath])
        .filter((p): p is string => Boolean(p))
    await removeFiles(supabase, BTP_BUCKET, paths)

    const res = await tryCatch(
        prisma.bTPTutorApplication.updateMany({
            where: { id: { in: expired.value.map((r) => r.id) } },
            data: {
                firstName: "",
                lastName: "",
                email: "",
                cvPath: "",
                mlPath: ""
            }
        })
    )
    if (!res.success) {
        captureActionError(res.error)
        return 0
    }
    return res.value.count
}

/**
 * Adhesion dossiers: kept 3 years from submission, then deleted. Associations
 * renew yearly, so an expired dossier can go; we only detach it from its
 * `Association` (kept) and remove its uploaded documents from storage.
 */
async function purgeAdhesions(supabase: AdminClient): Promise<number> {
    const expired = await tryCatch(
        prisma.adhesion.findMany({
            where: { createdAt: { lt: yearsAgo(3) } },
            select: {
                id: true,
                logoPath: true,
                statutsPath: true,
                recepissePath: true,
                extraitPVPath: true,
                lettreEngagementPath: true,
                reglementInterieurPath: true,
                bilanFinancierPath: true,
                photosPaths: true
            }
        })
    )
    if (!expired.success) {
        captureActionError(expired.error)
        return 0
    }
    if (expired.value.length === 0) return 0

    const ids = expired.value.map((r) => r.id)
    const paths = expired.value
        .flatMap((r) => [
            r.logoPath,
            r.statutsPath,
            r.recepissePath,
            r.extraitPVPath,
            r.lettreEngagementPath,
            r.reglementInterieurPath,
            r.bilanFinancierPath,
            ...r.photosPaths
        ])
        .filter((p): p is string => Boolean(p))
    await removeFiles(supabase, ADHESION_BUCKET, paths)

    // Detach the dossier from any active association (kept), then delete it.
    const unlink = await tryCatch(
        prisma.association.updateMany({
            where: { adhesionId: { in: ids } },
            data: { adhesionId: null }
        })
    )
    if (!unlink.success) {
        captureActionError(unlink.error)
        return 0
    }

    const del = await tryCatch(
        prisma.adhesion.deleteMany({ where: { id: { in: ids } } })
    )
    if (!del.success) {
        captureActionError(del.error)
        return 0
    }
    return del.value.count
}

/**
 * Enforce the data-retention policy: delete or anonymise personal data past its
 * retention period. Each table is best-effort and independent: a failure on one
 * is captured and the others still run.
 */
export async function runPurge(): Promise<PurgeSummary> {
    const supabase = createAdminClient()
    return {
        btpQuestions: await purgeBtpQuestions(),
        btpApplications: await anonymiseBtpApplications(supabase),
        bagadTickets: await anonymiseBagadTickets(),
        adhesions: await purgeAdhesions(supabase)
    }
}
