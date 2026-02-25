import { z } from "zod"

export const maxUploadSizeInMb = 10

/**
 * Base schema for member data (shared between client and server)
 */
export const MemberBaseSchema = z.object({
    lastName: z.string().min(1, "Le nom de famille est obligatoire"),
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    position: z.string().min(1, "Le poste est obligatoire"),
    email: z.string().email("L'email doit être valide"),
    facebook: z
        .string()
        .url("L'URL Facebook doit être valide")
        .optional()
        .or(z.literal("")),
    instagram: z
        .string()
        .url("L'URL Instagram doit être valide")
        .optional()
        .or(z.literal("")),
    twitter: z
        .string()
        .url("L'URL Twitter doit être valide")
        .optional()
        .or(z.literal(""))
})

/**
 * Client-side schema for forms with file upload
 * Uses FileList for browser file input validation
 */
export const MemberClientSchema = MemberBaseSchema.extend({
    picture: z
        .instanceof(FileList, { message: "Veuillez sélectionner une image" })
        .refine((fl) => fl.length > 0, {
            message: "Pas de fichier selectionné"
        })
        .refine((fl) => fl[0].type.split("/")[0] === "image", {
            message: "Le format de l'image n'est pas valide"
        })
        .refine(
            (fl) => fl[0].size <= 1024 * 1024 * maxUploadSizeInMb,
            `La taille de l'image doit être inférieure à ${maxUploadSizeInMb} Mo`
        )
})

/**
 * Server-side schema for action validation
 * Uses string path after file upload
 */
export const MemberServerSchema = MemberBaseSchema.extend({
    picturePath: z.string().min(1, "Le chemin de l'image est obligatoire")
})

/**
 * Client-side schema for editing members (picture is optional)
 */
export const MemberEditClientSchema = MemberBaseSchema.extend({
    id: z.string().min(1, "L'id est obligatoire"),
    picture: z
        .instanceof(FileList, { message: "Format de fichier invalide" })
        .optional()
        .refine(
            (fl) =>
                !fl || fl.length === 0 || fl[0].type.split("/")[0] === "image",
            "Le format de l'image n'est pas valide"
        )
        .refine(
            (fl) =>
                !fl ||
                fl.length === 0 ||
                fl[0].size <= 1024 * 1024 * maxUploadSizeInMb,
            `La taille de l'image doit être inférieure à ${maxUploadSizeInMb} Mo`
        )
})

export type MemberClient = z.infer<typeof MemberClientSchema>
export type MemberEditClient = z.infer<typeof MemberEditClientSchema>
export type MemberServer = z.infer<typeof MemberServerSchema>
