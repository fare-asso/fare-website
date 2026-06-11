import { type } from "arktype"

export const EditLinkCategorySchema = type({
    id: "number.integer >= 1",
    name: "string >= 1"
})

export const AddLinkCategorySchema = EditLinkCategorySchema.pick("name")

export const EditLinkSchema = type({
    id: "number.integer >= 1",
    categoryId: "number.integer >= 1",
    label: "string >= 1",
    url: type("string.url >= 1").configure({
        message: (ctx) => {
            if (!ctx.data) return "URL requise"
            return "URL invalide"
        }
    })
})

export const AddLinkSchema = EditLinkSchema.pick("categoryId", "label", "url")

export type TAddLinkCategory = typeof AddLinkCategorySchema.infer
export type TEditLinkCategory = typeof EditLinkCategorySchema.infer
export type TAddLink = typeof AddLinkSchema.infer
export type TEditLink = typeof EditLinkSchema.infer
