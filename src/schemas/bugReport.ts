import { isDevelopment } from "std-env"
import { z } from "zod"

export const BugReportSchema = z.object({
    email: z.email("Veuillez entrer une adresse email valide."),
    bugType: z
        .string()
        .min(1, "Veuillez sélectionner un type de bug.")
        .max(100, "Le type de bug est trop long."),
    description: z
        .string()
        .min(10, "La description doit faire au moins 10 caractères.")
        .max(2000, "La description ne peut pas dépasser 2000 caractères."),
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha."
    })
})

export type BugReport = z.infer<typeof BugReportSchema>
