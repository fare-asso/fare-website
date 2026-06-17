import { type } from "arktype"
import { z } from "zod/mini"

export const frenchPhone = type("/^((0[1-9]([.\\s]?\\d{2}){4})|)$/")

const mimeTypes = {
    image: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    pdf: ["application/pdf"]
}

type MimeKey = "pdf" | "image"

type FileSchemaOptions = {
    errorMessage?: string
    typeErrorMessage?: string
    mimeType?: MimeKey | MimeKey[]
    /** Explicit MIME allow-list; overrides the `mimeType` groups when set. */
    mimes?: string[]
    /** Maximum file size in bytes. Adds a server-side size guard when set. */
    maxSize?: number
    sizeErrorMessage?: string
}

type FileSchema = ReturnType<typeof z.file>
type OptionalFileSchema = ReturnType<typeof z.optional<FileSchema>>

/**
 * Zod schema for a file input. Defaults to a required PDF file.
 * `mimeType` accepts a single group or an array to allow several
 * (e.g. `["image", "pdf"]`).
 *
 * @returns the Zod schema for a file input
 */
export function fileSchema(
    opts?: FileSchemaOptions & { optional?: false }
): FileSchema
export function fileSchema(
    opts: FileSchemaOptions & { optional: true }
): OptionalFileSchema
export function fileSchema({
    errorMessage,
    typeErrorMessage,
    mimeType,
    mimes,
    maxSize,
    sizeErrorMessage,
    optional = false
}: FileSchemaOptions & { optional?: boolean } = {}):
    | FileSchema
    | OptionalFileSchema {
    let keys: MimeKey[]
    if (!mimeType) {
        keys = ["pdf"]
    } else if (Array.isArray(mimeType)) {
        keys = mimeType
    } else {
        keys = [mimeType]
    }

    const allowedMimes = mimes ?? keys.flatMap((key) => mimeTypes[key])
    const onlyPdf = keys.length === 1 && keys[0] === "pdf"
    const onlyImage = keys.length === 1 && keys[0] === "image"

    errorMessage ??= onlyImage
        ? "Veuillez fournir une image."
        : "Veuillez fournir un fichier."

    if (typeErrorMessage === undefined) {
        if (onlyPdf) {
            typeErrorMessage = "Le fichier doit être au format PDF."
        } else if (onlyImage) {
            typeErrorMessage =
                "L'image doit être au format PNG, JPG, WebP ou SVG."
        } else {
            typeErrorMessage =
                "Le fichier doit être une image (PNG, JPG, WebP, SVG) ou un PDF."
        }
    }

    const base = z.file({ error: errorMessage })
    const mimeCheck = z.mime(allowedMimes, { error: typeErrorMessage })

    const schema =
        maxSize === undefined
            ? base.check(mimeCheck)
            : base.check(
                  mimeCheck,
                  z.maxSize(maxSize, {
                      error:
                          sizeErrorMessage ??
                          "Le fichier dépasse la taille maximale autorisée."
                  })
              )

    return optional ? z.optional(schema) : schema
}
