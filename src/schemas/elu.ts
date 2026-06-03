import { type } from "arktype"

export const AddEluSchema = type({
    conseilId: "number.integer >= 1",
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string >= 1"
})

export const EditEluSchema = type({
    id: "number.integer >= 1",
    conseilId: "number.integer >= 1",
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string >= 1"
})

export const ImportEluRowSchema = type({
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string >= 1"
})

export const BulkImportEluSchema = type({
    conseilId: "number.integer >= 1",
    elus: ImportEluRowSchema.array().atLeastLength(1)
})

export type TAddElu = typeof AddEluSchema.infer
export type TEditElu = typeof EditEluSchema.infer
export type TImportEluRow = typeof ImportEluRowSchema.infer
export type TBulkImportElu = typeof BulkImportEluSchema.infer
