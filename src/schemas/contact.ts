import { z } from "zod";

export const ContactSchema = z.object({
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    email: z.string().email({ message: "Email non-valide" }),
    message: z
        .string()
        .min(1, { message: "Le message est obligatoire" })
        .max(300, { message: "Le message est trop long" }),
});

export type Contact = z.infer<typeof ContactSchema>;
