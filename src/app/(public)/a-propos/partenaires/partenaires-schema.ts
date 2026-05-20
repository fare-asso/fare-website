import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

const logoSchemaOptions = {
    mimeType: "image" as const,
    errorMessage: "Veuillez fournir un logo.",
    typeErrorMessage: "Le logo doit être au format PNG, JPG, WebP ou SVG."
}

export const AddPartenaireSchema = type({
    name: "string >= 1",
    description: "1 <= string <= 1000",
    logo: fileSchema(logoSchemaOptions)
})

export const EditPartenaireSchema = type({
    id: "number.integer >= 1",
    name: "string >= 1",
    description: "1 <= string <= 1000",
    "logo?": fileSchema({ ...logoSchemaOptions, optional: true })
})

export type TAddPartenaire = typeof AddPartenaireSchema.infer
export type TEditPartenaire = typeof EditPartenaireSchema.infer
