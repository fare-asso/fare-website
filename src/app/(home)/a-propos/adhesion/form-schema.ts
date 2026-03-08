import { type } from "arktype"
import { z } from "zod/mini"

const frenchPhone = type("string").narrow((s) =>
    /^0[1-9]([.\s]?\d{2}){4}$/.test(s)
)

export const bureauMemberSchema = type({
    isAdmin: "boolean",
    poste: "string >= 1",
    nom: "string >= 1",
    prenom: "string >= 1",
    filiere: "string >= 1",
    annee: "string >= 1",
    "telephone?": frenchPhone,
    email: "string.email >= 1",
    adresse: "string >= 1"
})

export const AdhesionFormSchema = type({
    // Basic info
    sigle: "string",
    nomComplet: "string >= 3",
    logo: z.file(),

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

    // Captcha
    captchaToken: "string"
})

export type BureauMember = typeof bureauMemberSchema.infer
export type AdhesionForm = typeof AdhesionFormSchema.infer
