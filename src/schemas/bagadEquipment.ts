import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

const MAX_IMAGE_SIZE = 25 * 1024 * 1024

const imageSchemaOptions = {
    mimes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    errorMessage: "Veuillez fournir une image.",
    typeErrorMessage: "L'image doit être au format PNG, JPG, GIF ou WebP.",
    maxSize: MAX_IMAGE_SIZE,
    sizeErrorMessage: "L'image ne doit pas dépasser 25 Mo."
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
