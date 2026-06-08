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

export const ImportEluRowSchema = type({
    name: "string >= 1",
    position: "string >= 1",
    "description?": "string <= 1000"
})

export const BulkImportEluSchema = type({
    conseilId: "number.integer >= 1",
    elus: ImportEluRowSchema.array().atLeastLength(1)
})

export const OrderSchema = type({
    id: "number.integer >= 1",
    order: "number.integer >= 0"
}).array()

export const BulkDeleteElusSchema = type("number.integer >= 1").array()

export type TAddElu = typeof AddEluSchema.infer
export type TEditElu = typeof EditEluSchema.infer
export type TImportEluRow = typeof ImportEluRowSchema.infer
export type TBulkImportElu = typeof BulkImportEluSchema.infer
export type TOrder = typeof OrderSchema.infer
export type TBulkDeleteElus = typeof BulkDeleteElusSchema.infer
