import { isDevelopment } from "std-env"
import { z } from "zod"

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/

export const bureauMemberSchema = z.object({
    isAdmin: z.boolean(),
    poste: z.string().min(1, "Le poste est requis."),
    nom: z.string().min(1, "Le nom est requis."),
    prenom: z.string().min(1, "Le prénom est requis."),
    filiere: z.string().min(1, "La filière est requise."),
    annee: z.string().min(1, "L'année d'études est requise."),
    telephone: z
        .string()
        .min(1, "Le téléphone est requis.")
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide."),
    email: z
        .email("L'adresse email n'est pas valide.")
        .min(1, "L'email est requis."),
    adresse: z.string().min(1, "L'adresse postale est requise.")
})

export type BureauMember = z.infer<typeof bureauMemberSchema>

// Fields shared between client and server schemas
const baseFields = {
    // General info
    dateAdhesion: z.string().min(1, "La date de la demande est requise."),
    sigle: z.string().min(1, "Le sigle de l'association est requis."),
    nomComplet: z
        .string()
        .min(1, "Le nom complet de l'association est requis."),

    // Administrative
    college: z.enum(["A", "B"], {
        error: "Veuillez sélectionner un collège."
    }),
    filiere: z.string().min(1, "La filière de l'association est requise."),
    objetPrincipal: z
        .string()
        .min(1, "L'objet principal de l'association est requis."),
    adresseAdministrative: z
        .string()
        .min(1, "L'adresse administrative est requise."),
    siegeSocial: z.string(),
    numeroSalle: z.string(),
    dateAG: z.string().min(1, "La date de la dernière AG est requise."),
    nombreEtudiantsRepresentes: z
        .number()
        .min(1, "Le nombre d'étudiants représentés doit être supérieur à 0."),
    nombreAdherents: z
        .number()
        .min(1, "Le nombre d'adhérents doit être supérieur à 0."),
    engagementCotisation: z.literal(true, {
        error: "Vous devez vous engager à régler la cotisation."
    }),

    // Contacts
    emailAssociation: z
        .email("L'adresse email n'est pas valide.")
        .min(1, "L'email de l'association est requis."),
    telephonePortable: z
        .string()
        .min(1, "Le numéro de téléphone portable est requis.")
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide."),
    telephoneFixe: z
        .string()
        .refine(
            (val) => val === "" || phoneRegex.test(val),
            "Le numéro de téléphone fixe n'est pas valide."
        ),

    // Bureau
    bureau: z
        .array(bureauMemberSchema)
        .min(1, "Au moins un membre du bureau est requis.")
        .refine(
            (members) => members.filter((m) => m.isAdmin).length <= 2,
            "Vous ne pouvez pas avoir plus de 2 administrateurs."
        ),

    // Captcha
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha."
    })
}

// Client-side schema (used in TanStack Form)
export const AdhesionClientFormSchema = z.object(baseFields)

// Server-side schema (identical for now, but kept separate for extensibility)
export const AdhesionFormSchema = z.object(baseFields)

export type AdhesionFormData = z.infer<typeof AdhesionFormSchema>
