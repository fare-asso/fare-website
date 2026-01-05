import { isDevelopment } from "std-env"
import { z } from "zod"

export const eventTypes = [
    { value: "Weekend de cohésion", label: "Weekend de cohésion" },
    { value: "Soirée", label: "Soirée" },
    { value: "Stand", label: "Stand" },
    { value: "Temps démocratique", label: "Temps démocratique (AG/CA)" },
    { value: "Conférence", label: "Conférence" },
    { value: "Séjour", label: "Séjour" },
    { value: "other", label: "Autre" }
] as const

// Schema for server-side validation
export const bagadAssoFormSchema = z.object({
    associationName: z.string().min(1, "Le nom de l'association est requis."),
    associationEmail: z
        .email("Veuillez entrer une adresse email valide.")
        .min(1, "L'email de l'association est requis."),
    referentLastName: z.string().min(1, "Le nom du référent est requis."),
    referentFirstName: z.string().min(1, "Le prénom du référent est requis."),
    referentEmail: z
        .email("Veuillez entrer une adresse email valide.")
        .min(1, "L'email du référent est requis."),
    referentPhone: z.string(),
    eventName: z.string().min(1, "Le nom de l'évènement est requis."),
    eventType: z.string().min(1, "Le type de l'évènement est requis."),
    eventDate: z.coerce.date({
        error: "La date de l'évènement est requise."
    }),
    eventAddress: z.string().min(1, "L'adresse de l'évènement est requise."),
    eventParticipants: z
        .number()
        .min(1, "Le nombre de participants doit être au moins 1."),
    equipment: z
        .string()
        .min(1, "Veuillez sélectionner au moins un matériel.")
        .refine(
            (val) => {
                try {
                    const parsed = JSON.parse(val)
                    return Array.isArray(parsed) && parsed.length > 0
                } catch {
                    return false
                }
            },
            { message: "Veuillez sélectionner au moins un matériel." }
        ),
    termsAccepted: z.literal(true, {
        error: "Vous devez accepter les termes et conditions."
    }),
    // requite captcha token only when !isDevelopment
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha."
    })
})

// Type for data sent to server action
export type BagadAssoFormData = z.infer<typeof bagadAssoFormSchema>
