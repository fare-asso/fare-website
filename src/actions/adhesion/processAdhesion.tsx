import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import AdhesionAck from "@/../emails/adhesion-acknowledgement"
import { AdhesionTemplate } from "@/../emails/new-adhesion"
import { verifyCaptcha } from "@/components/captcha/verify.server"
import prisma from "@/helpers/db.server"
import { sendEmail } from "@/helpers/email.server"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AdhesionFormSchema, type TAdhesionForm } from "@/schemas/adhesion"

const BUCKET = "adhesion"

const logoExtensionByMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "application/pdf": "pdf"
}

type Result = { success: true } | { success: false; message: string }

export const processAdhesion = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "processAdhesion",
            async ({ data: formData }): Promise<Result> => {
                // The form travels as FormData (typed serverFn args cannot
                // carry Files) — rebuild the raw object before validation.
                const stringEntry = (key: string): string => {
                    const entry = formData.get(key)
                    return typeof entry === "string" ? entry : ""
                }
                const fileEntry = (key: string): File | undefined => {
                    const entry = formData.get(key)
                    return entry instanceof File ? entry : undefined
                }
                const dateAG = new Date(stringEntry("dateAG"))
                const bureau = tryCatch(
                    () =>
                        JSON.parse(
                            stringEntry("bureau")
                        ) as TAdhesionForm["bureau"]
                )

                const data = AdhesionFormSchema({
                    sigle: stringEntry("sigle"),
                    nomComplet: stringEntry("nomComplet"),
                    logo: fileEntry("logo"),
                    college: stringEntry("college"),
                    filiere: stringEntry("filiere"),
                    objetPrincipal: stringEntry("objetPrincipal"),
                    adresseAdministrative: stringEntry("adresseAdministrative"),
                    siegeSocial: stringEntry("siegeSocial"),
                    numeroSalle: stringEntry("numeroSalle"),
                    dateAG: Number.isNaN(dateAG.getTime()) ? undefined : dateAG,
                    nombreEtudiantsRepresentes: Number(
                        stringEntry("nombreEtudiantsRepresentes")
                    ),
                    nombreAdherents: Number(stringEntry("nombreAdherents")),
                    engagementCotisation:
                        stringEntry("engagementCotisation") === "true",
                    emailAssociation: stringEntry("emailAssociation"),
                    telephonePortable: stringEntry("telephonePortable"),
                    telephoneFixe: stringEntry("telephoneFixe"),
                    bureau: bureau.success ? bureau.value : [],
                    statuts: fileEntry("statuts"),
                    recepisse: fileEntry("recepisse"),
                    extraitPV: fileEntry("extraitPV"),
                    lettreEngagement: fileEntry("lettreEngagement"),
                    reglementInterieur: fileEntry("reglementInterieur"),
                    bilanFinancier: fileEntry("bilanFinancier"),
                    photos: formData
                        .getAll("photos")
                        .filter(
                            (entry): entry is File => entry instanceof File
                        ),
                    captchaToken: stringEntry("captchaToken")
                })

                if (data instanceof type.errors) {
                    return { success: false, message: data.summary }
                }

                // Verify CAPTCHA in production only
                if (!isDevelopment) {
                    const isCaptchaValid = await verifyCaptcha(
                        data.captchaToken
                    )
                    if (!isCaptchaValid) {
                        return {
                            success: false,
                            message:
                                "La vérification du captcha a échoué. Veuillez réessayer."
                        }
                    }
                }

                if (
                    !data.logo ||
                    !data.statuts ||
                    !data.recepisse ||
                    !data.extraitPV
                ) {
                    return {
                        success: false,
                        message: "Veuillez fournir tous les documents requis."
                    }
                }

                const logoExt = logoExtensionByMime[data.logo.type]
                if (!logoExt) {
                    return {
                        success: false,
                        message:
                            "Le logo doit être au format PNG, JPG, WebP ou SVG."
                    }
                }

                const folder = `${crypto.randomUUID()}-${sanitizeString(data.sigle)}`
                const supabase = createClient()
                const uploaded: string[] = []

                const cleanup = async (): Promise<void> => {
                    if (uploaded.length > 0) {
                        await supabase.storage.from(BUCKET).remove(uploaded)
                    }
                }

                const upload = async (
                    name: string,
                    file: File
                ): Promise<string | null> => {
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
                const recepissePath = await upload(
                    "recepisse.pdf",
                    data.recepisse
                )
                const extraitPVPath = await upload(
                    "extraitPV.pdf",
                    data.extraitPV
                )

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

                const photoUploads = await tryCatch(
                    Promise.all(
                        (data.photos ?? []).map((photo, i) => {
                            const ext = logoExtensionByMime[photo.type]
                            return ext
                                ? upload(`photo-${i + 1}.${ext}`, photo)
                                : Promise.resolve(null)
                        })
                    )
                )
                if (!photoUploads.success) {
                    captureActionError(photoUploads.error)
                    await cleanup()
                    return {
                        success: false,
                        message:
                            "Échec de l'envoi des fichiers. Veuillez réessayer plus tard."
                    }
                }
                if (photoUploads.value.some((path) => !path)) {
                    await cleanup()
                    return {
                        success: false,
                        message:
                            "Échec de l'envoi des fichiers. Veuillez réessayer plus tard."
                    }
                }
                const photosPaths = photoUploads.value.filter(
                    (path): path is string => !!path
                )

                const created = await tryCatch(
                    prisma.adhesion.create({
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
                            nombreEtudiantsRepresentes:
                                data.nombreEtudiantsRepresentes,
                            engagementCotisation: data.engagementCotisation,
                            bureau: data.bureau,
                            folderPath: folder,
                            logoPath,
                            statutsPath,
                            recepissePath,
                            extraitPVPath,
                            lettreEngagementPath,
                            reglementInterieurPath,
                            bilanFinancierPath,
                            photosPaths
                        }
                    })
                )
                if (!created.success) {
                    captureActionError(created.error)
                    await cleanup()
                    return {
                        success: false,
                        message:
                            "Échec de l'enregistrement de la demande. Veuillez réessayer."
                    }
                }

                // Emails are best-effort: the request has already been persisted.
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
                    html: await render(
                        <AdhesionAck associationName={data.sigle} />
                    )
                })

                return { success: true }
            }
        )
    )
