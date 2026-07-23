import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

/** Types d'images acceptés par l'action côté serveur. */
const LOGO_MIMES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif"
]

export const MAX_LOGO_SIZE = 15 * 1024 * 1024

const logoSchemaOptions = {
    errorMessage: "Veuillez fournir un logo.",
    typeErrorMessage:
        "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF.",
    mimes: LOGO_MIMES,
    maxSize: MAX_LOGO_SIZE,
    sizeErrorMessage: "La taille du logo doit être inférieure à 15 Mo."
}

const AssociationBaseSchema = type({
    name: "string >= 1",
    major: "string >= 1",
    description: "1 <= string <= 1000",
    birthdate: "Date | string.date.iso.parse",
    location: "string >= 1",
    email: "string.email",
    website: "string.url | ''",
    facebook: "string.url | ''",
    instagram: "string.url | ''",
    twitter: "string.url | ''",
    discord: "string.url | ''"
})

export const AddAssociationSchema = AssociationBaseSchema.merge({
    logo: fileSchema(logoSchemaOptions)
})

export type TAddAssociation = typeof AddAssociationSchema.infer

// À la modification, le logo est optionnel : sans nouveau fichier, le
// logo actuel est conservé.
export const EditAssociationSchema = AssociationBaseSchema.merge({
    "logo?": fileSchema({ ...logoSchemaOptions, optional: true })
})

export type TEditAssociation = typeof EditAssociationSchema.infer

export const ASSOCIATION_SOCIAL_KEYS = [
    "website",
    "facebook",
    "instagram",
    "twitter",
    "discord"
] as const
