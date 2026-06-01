import { type } from "arktype"

export const AddEluSchema = type({
    conseilId: "number.integer >= 1",
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string <= 1000"
})

export const EditEluSchema = type({
    id: "number.integer >= 1",
    conseilId: "number.integer >= 1",
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string <= 1000"
})

export type TAddElu = typeof AddEluSchema.infer
export type TEditElu = typeof EditEluSchema.infer
