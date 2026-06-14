import { type } from "arktype"

import { fileSchema } from "@/schemas/reusables"

const pictureSchemaOptions = {
    mimeType: "image" as const,
    errorMessage: "Veuillez fournir une photo.",
    typeErrorMessage: "La photo doit être au format PNG, JPG, WebP ou SVG."
}

export const EditMemberSchema = type({
    id: "number.integer >= 1",
    lastName: "string >= 1",
    firstName: "string >= 1",
    position: "string >= 1",
    email: "string.email",
    "facebook?": "string.url | ''",
    "instagram?": "string.url | ''",
    "twitter?": "string.url | ''",
    "picture?": fileSchema({ ...pictureSchemaOptions, optional: true })
})

export const AddMemberSchema = EditMemberSchema.pick(
    "lastName",
    "firstName",
    "position",
    "email",
    "facebook",
    "instagram",
    "twitter"
).and({ picture: fileSchema(pictureSchemaOptions) })

export type TAddMember = typeof AddMemberSchema.infer
export type TEditMember = typeof EditMemberSchema.infer
