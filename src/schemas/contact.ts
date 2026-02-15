import { isDevelopment } from "std-env"
import { z } from "zod"

// Schema for server-side validation
export const ContactSchema = z.object({
    firstName: z.string().min(1, "Le prénom est obligatoire."),
    lastName: z.string().min(1, "Le nom est obligatoire."),
    email: z.email("Veuillez entrer une adresse email valide."),
    message: z
        .string()
        .min(1, "Le message est obligatoire.")
        .max(1000, "Le message ne peut pas dépasser 1000 caractères."),
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha."
    })
})

export type Contact = z.infer<typeof ContactSchema>
