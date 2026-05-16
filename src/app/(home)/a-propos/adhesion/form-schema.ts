import { type } from "arktype"
import { fileSchema } from "@/schemas/reusables"

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

    // Captcha
    captchaToken: "string >= 1"
})

export type BureauMember = typeof bureauMemberSchema.infer
export type AdhesionForm = typeof AdhesionFormSchema.infer
