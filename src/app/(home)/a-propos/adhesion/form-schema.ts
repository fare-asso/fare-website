import { type } from "arktype"
import { z } from "zod/mini"

const frenchPhone = type("/^((0[1-9]([.\\s]?\\d{2}){4})|)$/")

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

const pdfFile = z.file({ error: "Veuillez fournir un fichier." }).check(
    z.mime(["application/pdf"], {
        error: "Le fichier doit être au format PDF."
    })
)

export const AdhesionFormSchema = type({
    // Basic info
    sigle: "string >= 2",
    nomComplet: "string >= 3",
    logo: z
        .file({
            error: "Veuillez fournir le logo de l'association."
        })
        .check(
            z.mime(["image/png", "image/jpeg", "image/webp", "image/svg+xml"], {
                error: "Le logo doit être au format PNG, JPG, WebP ou SVG."
            })
        ),

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
    statuts: pdfFile,
    recepisse: pdfFile,
    extraitPV: pdfFile,
    "lettreEngagement?": z.optional(pdfFile),
    "reglementInterieur?": z.optional(pdfFile),
    "bilanFinancier?": z.optional(pdfFile),

    // Captcha
    captchaToken: "string >= 1"
})

export type BureauMember = typeof bureauMemberSchema.infer
export type AdhesionForm = typeof AdhesionFormSchema.infer
