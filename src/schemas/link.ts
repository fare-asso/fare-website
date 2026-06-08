import { type } from "arktype"

export const AddLinkCategorySchema = type({
    name: "string >= 1"
})

export const EditLinkCategorySchema = type({
    id: "number.integer >= 1",
    name: "string >= 1"
})

export const AddLinkSchema = type({
    categoryId: "number.integer >= 1",
    label: "string >= 1",
    url: "string >= 1"
})

export const EditLinkSchema = type({
    id: "number.integer >= 1",
    categoryId: "number.integer >= 1",
    label: "string >= 1",
    url: "string >= 1"
})

export type TAddLinkCategory = typeof AddLinkCategorySchema.infer
export type TEditLinkCategory = typeof EditLinkCategorySchema.infer
export type TAddLink = typeof AddLinkSchema.infer
export type TEditLink = typeof EditLinkSchema.infer
