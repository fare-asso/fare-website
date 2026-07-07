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

export function instanceFormData(
    input: TAddInstance | TEditInstance
): FormData {
    const fd = new FormData()
    if ("id" in input) fd.set("id", String(input.id))
    fd.set("name", input.name)
    fd.set("contactEmail", input.contactEmail)
    if (input.description !== undefined) {
        fd.set("description", input.description)
    }
    for (const logo of input.logos ?? []) fd.append("logos", logo)
    return fd
}
