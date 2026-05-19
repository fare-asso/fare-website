"use server"

import { render } from "@react-email/render"
import { type } from "arktype"
import { revalidatePath } from "next/cache"
import { isDevelopment } from "std-env"

import AdhesionAck from "@/../emails/adhesion-acknowledgement"
import { AdhesionTemplate } from "@/../emails/new-adhesion"
import { verifyCaptcha } from "@/components/captcha/verify"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

import { AdhesionFormSchema, type TAdhesionForm } from "./form-schema"

const BUCKET = "adhesion"

const logoExtensionByMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg"
}

type Result = { success: true } | { success: false; message: string }

async function processAdhesionImpl(formData: TAdhesionForm): Promise<Result> {
    const data = AdhesionFormSchema(formData)

    if (data instanceof type.errors) {
        return { success: false, message: data.summary }
    }

    // Verify CAPTCHA in production only
    if (!isDevelopment) {
        const isCaptchaValid = await verifyCaptcha(data.captchaToken)
        if (!isCaptchaValid) {
            return {
                success: false,
                message:
                    "La vérification du captcha a échoué. Veuillez réessayer."
            }
        }
    }

    if (!data.logo || !data.statuts || !data.recepisse || !data.extraitPV) {
        return {
            success: false,
            message: "Veuillez fournir tous les documents requis."
        }
    }

    const logoExt = logoExtensionByMime[data.logo.type]
    if (!logoExt) {
        return {
            success: false,
            message: "Le logo doit être au format PNG, JPG, WebP ou SVG."
        }
    }

    const folder = `${crypto.randomUUID()}-${sanitizeString(data.sigle)}`
    const supabase = await createClient()
    const uploaded: string[] = []

    const cleanup = async (): Promise<void> => {
        if (uploaded.length > 0) {
            await supabase.storage.from(BUCKET).remove(uploaded)
        }
    }

    const upload = async (name: string, file: File): Promise<string | null> => {
        const path = `${folder}/${name}`
        const { data: result, error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file)
        if (error || !result) {
            console.error(error)
            return null
        }
        uploaded.push(result.path)
        return result.path
    }

    const logoPath = await upload(`logo.${logoExt}`, data.logo)
    const statutsPath = await upload("statuts.pdf", data.statuts)
    const recepissePath = await upload("recepisse.pdf", data.recepisse)
    const extraitPVPath = await upload("extraitPV.pdf", data.extraitPV)

    let lettreEngagementPath: string | null = null
    if (data.lettreEngagement) {
        lettreEngagementPath = await upload(
            "lettreEngagement.pdf",
            data.lettreEngagement
        )
    }

    let reglementInterieurPath: string | null = null
    if (data.reglementInterieur) {
        reglementInterieurPath = await upload(
            "reglementInterieur.pdf",
            data.reglementInterieur
        )
    }

    let bilanFinancierPath: string | null = null
    if (data.bilanFinancier) {
        bilanFinancierPath = await upload(
            "bilanFinancier.pdf",
            data.bilanFinancier
        )
    }

    if (
        !logoPath ||
        !statutsPath ||
        !recepissePath ||
        !extraitPVPath ||
        (data.lettreEngagement && !lettreEngagementPath) ||
        (data.reglementInterieur && !reglementInterieurPath) ||
        (data.bilanFinancier && !bilanFinancierPath)
    ) {
        await cleanup()
        return {
            success: false,
            message:
                "Échec de l'envoi des fichiers. Veuillez réessayer plus tard."
        }
    }

    try {
        await prisma.adhesion.create({
            data: {
                association: data.nomComplet,
                nomComplet: data.nomComplet,
                sigle: data.sigle,
                email: data.emailAssociation,
                telephonePortable: data.telephonePortable ?? "",
                telephoneFixe: data.telephoneFixe || null,
                college: data.college,
                filiere: data.filiere,
                objetPrincipal: data.objetPrincipal,
                adresseAdministrative: data.adresseAdministrative,
                siegeSocial: data.siegeSocial,
                numeroSalle: data.numeroSalle,
                dateAG: data.dateAG,
                nombreAdherents: data.nombreAdherents,
                nombreEtudiantsRepresentes: data.nombreEtudiantsRepresentes,
                engagementCotisation: data.engagementCotisation,
                bureau: data.bureau,
                folderPath: folder,
                logoPath,
                statutsPath,
                recepissePath,
                extraitPVPath,
                lettreEngagementPath,
                reglementInterieurPath,
                bilanFinancierPath
            }
        })
    } catch (e) {
        captureActionError(e)
        await cleanup()
        return {
            success: false,
            message:
                "Échec de l'enregistrement de la demande. Veuillez réessayer."
        }
    }

    // Emails are best-effort: the request has already been persisted.
    try {
        await sendEmail({
            to: "secretariat@fare-asso.fr",
            subject: `Nouvelle demande d'adhésion - ${data.sigle}`,
            html: await render(
                <AdhesionTemplate associationName={data.sigle} />
            )
        })
        await sendEmail({
            to: data.emailAssociation,
            subject: "Demande d'adhésion reçue",
            html: await render(<AdhesionAck associationName={data.sigle} />)
        })
    } catch (e) {
        captureActionError(e)
    }

    revalidatePath("/dashboard/adhesions")
    return { success: true }
}

export const processAdhesion = withServerAction(
    "processAdhesion",
    processAdhesionImpl
)
