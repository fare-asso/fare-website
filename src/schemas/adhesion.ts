import { type } from "arktype"

import { fileSchema, frenchPhone } from "@/schemas/reusables"

export const bureauMemberSchema = type({
    isAdmin: "boolean",
    poste: "string >= 1",
    nom: "string >= 1",
    prenom: "string >= 1",
    filiere: "string >= 1",
    annee: "string >= 1",
    telephone: frenchPhone,
    email: "string.email >= 1",
    adresse: "string >= 1"
})

const photosSchema = type(fileSchema({ mimeType: ["image", "pdf"] }))
    .array()
    .atMostLength(15)

export const AdhesionFormSchema = type({
    // Basic info
    sigle: "string >= 2",
    nomComplet: "string >= 3",
    logo: fileSchema({
        errorMessage: "Veuillez fournir un logo.",
        typeErrorMessage: "Le logo doit être au format PNG, JPG, WebP ou SVG.",
        mimeType: "image"
    }),

    // Administrative
    college: "'A' | 'B'",
    filiere: "string >= 1",
    objetPrincipal: "string >= 1",
    adresseAdministrative: "string >= 1",
    siegeSocial: "string",
    numeroSalle: "string",
    dateAG: "Date",
    nombreEtudiantsRepresentes: "number.integer >= 1",
    nombreAdherents: "number.integer >= 1",
    engagementCotisation: "true",

    // Contacts
    emailAssociation: "string.email >= 1",
    "telephonePortable?": frenchPhone,
    "telephoneFixe?": frenchPhone,

    // Bureau
    bureau: bureauMemberSchema.array().atLeastLength(1),

    // Documents
    statuts: fileSchema(),
    recepisse: fileSchema(),
    extraitPV: fileSchema(),
    "lettreEngagement?": fileSchema({ optional: true }),
    "reglementInterieur?": fileSchema({ optional: true }),
    "bilanFinancier?": fileSchema({ optional: true }),
    "photos?": photosSchema,

    // Captcha
    captchaToken: "string >= 1"
})

export type BureauMember = typeof bureauMemberSchema.infer
export type TAdhesionForm = typeof AdhesionFormSchema.infer

// serverFn transport: typed args cannot carry Files, so the form is sent as
// FormData and rebuilt server-side before running AdhesionFormSchema.
export function adhesionFormToFormData(value: TAdhesionForm): FormData {
    const fd = new FormData()
    fd.append("sigle", value.sigle)
    fd.append("nomComplet", value.nomComplet)
    if (value.logo) fd.append("logo", value.logo)
    fd.append("college", value.college)
    fd.append("filiere", value.filiere)
    fd.append("objetPrincipal", value.objetPrincipal)
    fd.append("adresseAdministrative", value.adresseAdministrative)
    fd.append("siegeSocial", value.siegeSocial)
    fd.append("numeroSalle", value.numeroSalle)
    if (value.dateAG instanceof Date) {
        fd.append("dateAG", value.dateAG.toISOString())
    }
    fd.append(
        "nombreEtudiantsRepresentes",
        String(value.nombreEtudiantsRepresentes)
    )
    fd.append("nombreAdherents", String(value.nombreAdherents))
    fd.append("engagementCotisation", String(value.engagementCotisation))
    fd.append("emailAssociation", value.emailAssociation)
    if (value.telephonePortable !== undefined) {
        fd.append("telephonePortable", value.telephonePortable)
    }
    if (value.telephoneFixe !== undefined) {
        fd.append("telephoneFixe", value.telephoneFixe)
    }
    fd.append("bureau", JSON.stringify(value.bureau))
    if (value.statuts) fd.append("statuts", value.statuts)
    if (value.recepisse) fd.append("recepisse", value.recepisse)
    if (value.extraitPV) fd.append("extraitPV", value.extraitPV)
    if (value.lettreEngagement) {
        fd.append("lettreEngagement", value.lettreEngagement)
    }
    if (value.reglementInterieur) {
        fd.append("reglementInterieur", value.reglementInterieur)
    }
    if (value.bilanFinancier) {
        fd.append("bilanFinancier", value.bilanFinancier)
    }
    for (const photo of value.photos ?? []) fd.append("photos", photo)
    fd.append("captchaToken", value.captchaToken)
    return fd
}
