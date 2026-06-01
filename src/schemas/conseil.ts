import { type } from "arktype"

export const AddConseilSchema = type({
    instanceId: "number.integer >= 1",
    name: "string >= 1",
    "description?": "string <= 1000"
})

export const EditConseilSchema = type({
    id: "number.integer >= 1",
    instanceId: "number.integer >= 1",
    name: "string >= 1",
    "description?": "string <= 1000"
})

export type TAddConseil = typeof AddConseilSchema.infer
export type TEditConseil = typeof EditConseilSchema.infer
