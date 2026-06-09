import { isDevelopment } from "std-env"
import { z } from "zod"

/* BTP Tutor Application */

export const BTPTutorApplicationSchema = z.object({
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    email: z.email({ message: "Email non-valide" }),
    major: z.string().min(1, { message: "La filière est obligatoire" }),
    studyYear: z.enum(["L3", "M1", "M2"], {
        message: "L'année d'étude est obligatoire"
    }),
    cv: z
        .instanceof(File)
        .refine((file) => file.type === "application/pdf", {
            message: "Le CV doit être un fichier PDF"
        })
        .refine((file) => file.size < 5 * 1024 * 1024, {
            message: "La taille du fichier doit être inférieure à 5Mo"
        }),
    motivationLetter: z
        .instanceof(File)
        .refine((file) => file.type === "application/pdf", {
            message: "La lettre de motivation doit être un fichier PDF"
        })
        .refine((file) => file.size < 5 * 1024 * 1024, {
            message: "La taille du fichier doit être inférieure à 5Mo"
        }),
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha"
    })
})

export type BTPTutorApplication = z.infer<typeof BTPTutorApplicationSchema>

/* BTP Tutor Question */

export const BTPTutorQuestionSchema = z.object({
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    email: z.email({ message: "Email non-valide" }),
    major: z.string().min(1, { message: "La filière est obligatoire" }),
    studyYear: z.enum(["L3", "M1", "M2", "other"], {
        message: "L'année d'étude est obligatoire"
    }),
    message: z
        .string()
        .min(1, { message: "Le message est obligatoire" })
        .max(1000, {
            message: "Le message doit faire moins de 1000 caractères"
        }),
    captchaToken: z.string().refine((val) => isDevelopment || val !== "", {
        message: "Veuillez valider le captcha"
    })
})

export type BTPTutorQuestion = z.infer<typeof BTPTutorQuestionSchema>
