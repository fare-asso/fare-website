import { type } from "arktype"
import { z } from "zod/mini"

export const frenchPhone = type("/^((0[1-9]([.\\s]?\\d{2}){4})|)$/")

const mimeTypes = {
    image: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    pdf: ["application/pdf"]
}

/**
 * Zod schema for a file input. Defaults to required PDF file.
 *
 * @returns the Zod schema for a file input
 */
type MimeKey = "pdf" | "image"

export function fileSchema({
    errorMessage,
    typeErrorMessage,
    mimeType,
    optional
}:
    | {
          errorMessage?: string
          typeErrorMessage?: string
          mimeType?: MimeKey | MimeKey[]
          optional?: boolean
      }
    | undefined = {}) {
    let keys: MimeKey[]
    if (!mimeType) {
        keys = ["pdf"]
    } else if (Array.isArray(mimeType)) {
        keys = mimeType
    } else {
        keys = [mimeType]
    }

    const mimes = keys.flatMap((key) => mimeTypes[key])
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

    const schema = z
        .file({
            error: errorMessage
        })
        .check(
            z.mime(mimes, {
                error: typeErrorMessage
            })
        )

    return optional ? z.optional(schema) : schema
}
