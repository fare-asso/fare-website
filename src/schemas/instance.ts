import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

const logoSchemaOptions = {
    mimeType: "image" as const,
    errorMessage: "Veuillez fournir un logo.",
    typeErrorMessage: "Le logo doit être au format PNG, JPG, WebP ou SVG."
}

export const AddInstanceSchema = type({
    name: "string >= 1",
    contactEmail: "string.email >= 1",
    "description?": "string <= 1000",
    "logo?": fileSchema({ ...logoSchemaOptions, optional: true })
})

export const EditInstanceSchema = type({
    id: "number.integer >= 1",
    name: "string >= 1",
    contactEmail: "string.email >= 1",
    "description?": "string <= 1000",
    "logo?": fileSchema({ ...logoSchemaOptions, optional: true })
})

export type TAddInstance = typeof AddInstanceSchema.infer
export type TEditInstance = typeof EditInstanceSchema.infer
