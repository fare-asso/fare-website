// Bridges typed action inputs containing File objects across the Astro
// actions boundary: JSON fields travel under "payload", File fields under
// their own key ("key" for a single File, "key[]" for File arrays).
import { tryCatch } from "@/lib/utils"

export function encodeFormPayload(data: Record<string, unknown>): FormData {
    const formData = new FormData()
    const json: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
        if (value instanceof File) {
            formData.append(key, value)
        } else if (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => item instanceof File)
        ) {
            for (const file of value) formData.append(`${key}[]`, file)
        } else {
            json[key] = value
        }
    }
    formData.set("payload", JSON.stringify(json))
    return formData
}

export function decodeFormPayload<T>(formData: FormData): T {
    const raw = formData.get("payload")
    const parsed = tryCatch(() =>
        JSON.parse(typeof raw === "string" ? raw : "{}")
    )
    const data: Record<string, unknown> = parsed.success
        ? (parsed.value as Record<string, unknown>)
        : {}
    for (const key of new Set(formData.keys())) {
        if (key === "payload") continue
        if (key.endsWith("[]")) {
            data[key.slice(0, -2)] = formData
                .getAll(key)
                .filter((value) => value instanceof File)
        } else {
            const value = formData.get(key)
            if (value instanceof File) data[key] = value
        }
    }
    return data as T
}
