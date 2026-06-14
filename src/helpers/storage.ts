import { randomUUID } from "node:crypto"

/**
 * Build a storage-safe, unique file name from an uploaded file's name.
 * Keeps alphanumerics, `-` and `_`, replaces every other run with `-`, then
 * appends a short random suffix to guarantee uniqueness.
 */
export function uniqueFileName(originalName: string): string {
    const dot = originalName.lastIndexOf(".")
    const base = dot > 0 ? originalName.slice(0, dot) : originalName
    const ext = dot > 0 ? originalName.slice(dot + 1) : "bin"

    const safeBase =
        base.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "file"
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin"

    return `${safeBase}-${randomUUID().slice(0, 8)}.${safeExt}`
}
