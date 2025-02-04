import { z } from "zod";

export const BTPTutorApplicationSchema = z.object({
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    email: z.string().email({ message: "Email non-valide" }),
    major: z.string().min(1, { message: "La filière est obligatoire" }),
    studyYear: z.enum(["L3", "M1", "M2"], {
        message: "L'année d'étude est obligatoire",
    }),
    cv: z.instanceof(File).refine((file) => file.type === "application/pdf", {
        message: "Le CV doit être un fichier PDF",
    }),
    motivationLetter: z
        .instanceof(File)
        .refine((file) => file.type === "application/pdf", {
            message: "La lettre de motivation doit être un fichier PDF",
        }),
});

export type BTPTutorApplication = z.infer<typeof BTPTutorApplicationSchema>;
