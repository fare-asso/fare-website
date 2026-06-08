import { type } from "arktype"
import { z } from "zod/mini"

import { fileSchema } from "@/schemas/reusables"

const logosSchema = z.array(
    fileSchema({
        mimeType: "image",
        typeErrorMessage: "Le logo doit être au format PNG, JPG, WebP ou SVG."
    })
)

export const AddInstanceSchema = type({
    name: "string >= 1",
    contactEmail: "string.email >= 1",
    "description?": "string <= 1000",
    "logos?": logosSchema
})

export const EditInstanceSchema = type({
    id: "number.integer >= 1",
    name: "string >= 1",
    contactEmail: "string.email >= 1",
    "description?": "string <= 1000",
    "logos?": logosSchema
})

export type TAddInstance = typeof AddInstanceSchema.infer
export type TEditInstance = typeof EditInstanceSchema.infer
