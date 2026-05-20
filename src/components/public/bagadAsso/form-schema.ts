import { isDevelopment } from "std-env"
import { z } from "zod"

import { tryCatch } from "@/lib/utils"

export const eventTypes = [
    { value: "Weekend de cohésion", label: "Weekend de cohésion" },
    { value: "Soirée", label: "Soirée" },
    { value: "Stand", label: "Stand" },
    { value: "Temps démocratique", label: "Temps démocratique (AG/CA)" },
    { value: "Conférence", label: "Conférence" },
    { value: "Séjour", label: "Séjour" },
    { value: "other", label: "Autre" }
] as const

// Base schema fields (shared between client and server)
const baseFields = {
    associationName: z.string().min(1, "Le nom de l'association est requis."),
    associationEmail: z
        .email("Veuillez entrer une adresse email valide.")
        .min(1, "L'email de l'association est requis."),
    referentLastName: z.string().min(1, "Le nom du référent est requis."),
    referentFirstName: z.string().min(1, "Le prénom du référent est requis."),
    referentPosition: z
        .string()
        .min(1, "Le poste dans l'association est requis."),
    referentEmail: z
        .email("Veuillez entrer une adresse email valide.")
        .min(1, "L'email du référent est requis."),
    referentPhone: z
        .string()
        .refine(
            (val) => /^\d+$/.test(val),
            "Le numéro de téléphone ne doit contenir que des chiffres."
        )
        .refine(
            (val) => val.length === 10,
            "Le numéro de téléphone doit contenir 10 chiffres."
        ),
    eventName: z.string().min(1, "Le nom de l'évènement est requis."),
    eventType: z.string().min(1, "Le type de l'évènement est requis."),
    eventAddress: z.string().min(1, "L'adresse de l'évènement est requise."),
    eventParticipants: z
        .number()
        .min(1, "Le nombre de participants doit être au moins 1."),
    equipment: z
        .string()
        .min(1, "Veuillez sélectionner au moins un matériel.")
        .refine(
            (val) => {
                const parsed = tryCatch(() => JSON.parse(val) as unknown)
                return (
                    parsed.success &&
                    Array.isArray(parsed.value) &&
                    parsed.value.length > 0
                )
            },
            { message: "Veuillez sélectionner au moins un matériel." }
        ),
    termsAccepted: z.literal(true, {
        error: "Vous devez accepter les termes et conditions."
    }),
    // require captcha token only when !isDevelopment
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha."
    })
}

// Schema for client-side validation (used in TanStack Form)
// Uses z.date() for eventDate since the form works with Date objects
export const BagadAssoClientFormSchema = z.object({
    ...baseFields,
    eventDate: z.date({
        error: "La date de l'évènement est requise."
    })
})

// Schema for server-side validation
// Uses z.coerce.date() for eventDate to handle string serialization
export const BagadAssoFormSchema = z.object({
    ...baseFields,
    eventDate: z.coerce.date({
        error: "La date de l'évènement est requise."
    })
})

// Type for data sent to server action
export type BagadAssoFormData = z.infer<typeof BagadAssoFormSchema>
