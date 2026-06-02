import { type } from "arktype"

export const AddConseilSchema = type({
    instanceId: "number.integer >= 1",
    name: "string >= 1",
    "description?": "string"
})

export const EditConseilSchema = type({
    id: "number.integer >= 1",
    instanceId: "number.integer >= 1",
    name: "string >= 1",
    "description?": "string"
})

export type TAddConseil = typeof AddConseilSchema.infer
export type TEditConseil = typeof EditConseilSchema.infer
