import { z } from "zod/mini"

const mimeTypes = {
    image: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    pdf: ["application/pdf"]
}

/**
 * Zod schema for a file input. Defaults to required PDF file.
 *
 * @returns the Zod schema for a file input
 */
export function fileSchema({
    errorMessage,
    typeErrorMessage,
    mimeType,
    optional
}:
    | {
          errorMessage?: string
          typeErrorMessage?: string
          mimeType?: "pdf" | "image"
          optional?: boolean
      }
    | undefined = {}) {
    mimeType ??= "pdf"
    errorMessage ??=
        mimeType === "pdf"
            ? "Veuillez fournir un fichier."
            : "Veuillez fournir une image."
    typeErrorMessage ??=
        mimeType === "pdf"
            ? "Le fichier doit être au format PDF."
            : "L'image doit être au format PNG, JPG, WebP ou SVG."

    const schema = z
        .file({
            error: errorMessage
        })
        .check(
            z.mime(mimeTypes[mimeType], {
                error: typeErrorMessage
            })
        )

    return optional ? z.optional(schema) : schema
}
