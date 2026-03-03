"use server"

import { randomUUID } from "node:crypto"
import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { isDevelopment } from "std-env"
import { verifyCaptcha } from "@/components/captcha/verify"
import {
    type AdhesionFormData,
    AdhesionFormSchema
} from "@/components/public/adhesion/form-schema"
import { generateAdhesionPdf } from "@/helpers/adhesion/generatePdf"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/server"
import AdhesionTemplate from "../../../emails/new-adhesion"

export type FormState = {
    error?: string
    success?: boolean
    fieldErrors?: Partial<Record<keyof AdhesionFormData, string[]>>
}

/**
 * Upload a file to Supabase Storage.
 * Returns the storage path on success, null if the file is empty/missing, or undefined on error.
 */
async function uploadFile(
    supabase: Awaited<ReturnType<typeof createClient>>,
    file: File,
    folder: string,
    filename: string,
    sanitizedSigle: string
): Promise<string | null | undefined> {
    if (!file || file.size === 0) return null

    const extension = file.name.split(".").pop()
    const fullFileName = `${sanitizeString(filename)}-${sanitizedSigle}.${extension}`

    const { data, error } = await supabase.storage
        .from("adhesion")
        .upload(`${folder}/${fullFileName}`, file)

    if (error) {
        console.error(
            `[ERROR] Failed to upload file ${fullFileName}:`,
            error.message
        )
        return undefined
    }
    return data.path
}

/**
 * Process an adhesion form submission.
 * Accepts a single FormData where:
 * - "data" field contains JSON-serialized AdhesionFormData
 * - File fields (logo, statuts, recepisse, extraitPV, etc.) are attached directly
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: inherently complex — validates data, files, generates PDF, uploads, saves, emails
export async function processAdhesionForm(
    _prevState: FormState | undefined,
    formData: FormData
): Promise<FormState> {
    // --- 1. Extract and validate structured data ---
    const rawData = formData.get("data")
    if (typeof rawData !== "string") {
        return { error: "Données du formulaire manquantes." }
    }

    let parsedData: unknown
    try {
        parsedData = JSON.parse(rawData)
    } catch {
        return { error: "Données du formulaire invalides." }
    }

    const result = AdhesionFormSchema.safeParse(parsedData)

    if (!result.success) {
        const fieldErrors: Partial<Record<keyof AdhesionFormData, string[]>> =
            {}
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof AdhesionFormData
            if (!fieldErrors[field]) {
                fieldErrors[field] = []
            }
            fieldErrors[field].push(issue.message)
        }
        return {
            error: "Un ou plusieurs champs sont invalides.",
            fieldErrors
        }
    }

    const validatedData = result.data

    // --- 2. Verify CAPTCHA ---
    if (!isDevelopment) {
        if (!validatedData.captchaToken) {
            return { error: "Veuillez compléter le CAPTCHA." }
        }
        const isCaptchaValid = await verifyCaptcha(validatedData.captchaToken)
        if (!isCaptchaValid) {
            return {
                error: "La vérification CAPTCHA a échoué. Veuillez réessayer."
            }
        }
    }

    // --- 3. Validate file uploads ---
    const logo = formData.get("logo") as File | null
    const statuts = formData.get("statuts") as File | null
    const recepisse = formData.get("recepisse") as File | null
    const extraitPV = formData.get("extraitPV") as File | null
    const reglementInterieur = formData.get("reglementInterieur") as File | null
    const bilanFinancier = formData.get("bilanFinancier") as File | null
    const lettreEngagement = formData.get("lettreEngagement") as File | null

    // Check required files
    const requiredFiles = { logo, statuts, recepisse, extraitPV }
    for (const [name, file] of Object.entries(requiredFiles)) {
        if (!file || file.size === 0) {
            return { error: `Le fichier "${name}" est requis.` }
        }
    }

    // Validate PDF type for required PDF files
    for (const [name, file] of Object.entries({
        statuts,
        recepisse,
        extraitPV
    })) {
        if (file && file.type !== "application/pdf") {
            return {
                error: `Le fichier "${name}" doit être au format PDF.`
            }
        }
    }

    // Validate optional PDF files (if provided, must be PDF)
    for (const [name, file] of Object.entries({
        reglementInterieur,
        bilanFinancier,
        lettreEngagement
    })) {
        if (file && file.size > 0 && file.type !== "application/pdf") {
            return {
                error: `Le fichier optionnel "${name}" doit être au format PDF.`
            }
        }
    }

    // --- 4. Generate PDF ---
    let pdfBytes: Uint8Array
    try {
        pdfBytes = await generateAdhesionPdf(validatedData)
    } catch (error) {
        console.error("[ERROR] Failed to generate PDF:", error)
        return { error: "Erreur lors de la génération du PDF." }
    }

    // --- 5. Upload files to Supabase ---
    const supabase = await createClient()
    const sanitizedSigle = sanitizeString(validatedData.sigle)
    const folderName = sanitizeString(
        `${validatedData.sigle}-${validatedData.dateAdhesion}`
    )
    const suffix = sanitizeString(
        `${validatedData.sigle}-${validatedData.dateAdhesion}`
    )

    // Upload generated PDF
    const { error: pdfUploadError } = await supabase.storage
        .from("adhesion")
        .upload(`${folderName}/adhesion-${suffix}.pdf`, pdfBytes, {
            contentType: "application/pdf"
        })

    if (pdfUploadError) {
        console.error(
            "[ERROR] Failed to upload generated PDF:",
            pdfUploadError.message
        )
        return {
            error: `Erreur lors de l'upload du PDF: ${pdfUploadError.message}`
        }
    }

    // Upload all files in parallel
    const uploadResults = await Promise.all([
        uploadFile(supabase, logo as File, folderName, "logo", sanitizedSigle),
        uploadFile(
            supabase,
            statuts as File,
            folderName,
            "statut",
            sanitizedSigle
        ),
        uploadFile(
            supabase,
            recepisse as File,
            folderName,
            "recepisse",
            sanitizedSigle
        ),
        uploadFile(
            supabase,
            extraitPV as File,
            folderName,
            "extraitPV",
            sanitizedSigle
        ),
        uploadFile(
            supabase,
            reglementInterieur as File,
            folderName,
            "reglement",
            sanitizedSigle
        ),
        uploadFile(
            supabase,
            bilanFinancier as File,
            folderName,
            "BF",
            sanitizedSigle
        ),
        uploadFile(
            supabase,
            lettreEngagement as File,
            folderName,
            "LE",
            sanitizedSigle
        )
    ])

    const [
        logoUrl,
        statutsUrl,
        recepisseUrl,
        extraitPVUrl,
        reglementInterieurUrl,
        bilanFinancierUrl,
        lettreEngagementUrl
    ] = uploadResults

    // Check required uploads succeeded
    if (
        logoUrl === undefined ||
        statutsUrl === undefined ||
        recepisseUrl === undefined ||
        extraitPVUrl === undefined
    ) {
        return {
            error: "Echec de l'upload d'un ou plusieurs fichiers obligatoires."
        }
    }

    // Log optional upload failures but don't block submission
    if (reglementInterieurUrl === undefined) {
        console.error(
            "[WARN] Failed to upload optional file: reglementInterieur"
        )
    }
    if (bilanFinancierUrl === undefined) {
        console.error("[WARN] Failed to upload optional file: bilanFinancier")
    }
    if (lettreEngagementUrl === undefined) {
        console.error("[WARN] Failed to upload optional file: lettreEngagement")
    }

    // --- 6. Save to database ---
    let record: Awaited<ReturnType<typeof prisma.adhesion.create>>
    try {
        record = await prisma.adhesion.create({
            data: {
                association: sanitizedSigle,
                folderPath: folderName,
                nomComplet: validatedData.nomComplet,
                sigle: validatedData.sigle,
                email: validatedData.emailAssociation,
                telephonePortable: validatedData.telephonePortable,
                telephoneFixe: validatedData.telephoneFixe || null,
                college: validatedData.college,
                objetPrincipal: validatedData.objetPrincipal,
                adresseAdministrative: validatedData.adresseAdministrative,
                dateAG: validatedData.dateAG
                    ? new Date(validatedData.dateAG)
                    : null,
                nombreAdherents: validatedData.nombreAdherents,
                nombreEtudiantsRepresentes:
                    validatedData.nombreEtudiantsRepresentes,
                bureau: JSON.parse(JSON.stringify(validatedData.bureau))
            }
        })
    } catch (error) {
        console.error("[ERROR] Failed to save adhesion to database:", error)
        return {
            error: "Erreur lors de l'enregistrement. Veuillez réessayer."
        }
    }

    // --- 7. Create pending Association from adhesion data ---
    try {
        // Upload logo to association-pictures bucket for the association record
        const logoFile = logo as File
        const assoLogoPath = randomUUID()
        const { error: assoLogoError } = await supabase.storage
            .from("association-pictures")
            .upload(assoLogoPath, logoFile)

        if (assoLogoError) {
            console.error(
                "[WARN] Failed to upload logo to association-pictures:",
                assoLogoError.message
            )
        } else {
            await prisma.association.create({
                data: {
                    name: validatedData.nomComplet,
                    major: validatedData.filiere,
                    desc: validatedData.objetPrincipal,
                    location: validatedData.adresseAdministrative,
                    email: validatedData.emailAssociation,
                    logoPath: assoLogoPath,
                    approved: null,
                    adhesionId: record.id
                }
            })
        }
    } catch (error) {
        // Non-blocking: log but don't fail the adhesion submission
        console.error("[WARN] Failed to create pending association:", error)
    }

    // --- 8. Send email notification (non-blocking) ---
    try {
        const emailResponse = await sendEmail({
            to: "secretariat@fare-asso.fr",
            subject: `Nouvelle demande d'adhésion - ${record.association}`,
            html: await render(
                <AdhesionTemplate associationName={record.association} />
            )
        })

        if (emailResponse.error) {
            console.error(
                "[WARN] Failed to send email notification:",
                emailResponse.error
            )
        }
    } catch (error) {
        console.error("[WARN] Email notification error:", error)
    }

    revalidatePath("/dashboard/adhesions")
    revalidatePath("/dashboard/associations")
    return { success: true }
}
