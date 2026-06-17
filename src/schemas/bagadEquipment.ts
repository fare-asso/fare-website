import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

const imageSchemaOptions = {
    mimeType: "image" as const,
    errorMessage: "Veuillez fournir une image.",
    typeErrorMessage: "L'image doit être au format PNG, JPG, WebP ou SVG."
}

export const AddEquipmentSchema = type({
    name: "string >= 1",
    quantity: "number.integer >= 0",
    deposit: "number >= 0",
    "image?": fileSchema({ ...imageSchemaOptions, optional: true })
})

export const EditEquipmentSchema = AddEquipmentSchema.and({
    id: "number.integer >= 1",
    removeImage: "boolean"
})

export type TAddEquipment = typeof AddEquipmentSchema.infer
export type TEditEquipment = typeof EditEquipmentSchema.infer
