import { tryCatch } from "@/lib/utils"

export interface JsonLocation {
    displayName: string
    coordinates: { lat: string; lon: string }
}

function isJsonLocation(value: unknown): value is JsonLocation {
    if (typeof value !== "object" || value === null) {
        return false
    }
    const obj = value as Partial<JsonLocation> //certaine propriété peuvent être manquante donc on les rend optionnelles
    return (
        typeof obj.displayName === "string" &&
        typeof obj.coordinates === "object" &&
        obj.coordinates !== null &&
        typeof obj.coordinates.lat === "string" &&
        typeof obj.coordinates.lon === "string"
    )
}

/**
 * Parse a stored `location` field (Event / Association / BagadAssoTicket rows).
 *
 * The value is either a JSON-encoded `JsonLocation` written by the
 * location picker, or a plain-text address typed directly by a user.
 * Returns a Rust-style Result so callers can narrow on `.success` and
 * pick their own fallback (short label, full address, map marker, …).
 */
export function parseLocation(value: string) {
    return tryCatch<JsonLocation>(() => {
        const parsed: unknown = JSON.parse(value)
        if (!isJsonLocation(parsed)) {
            throw new Error("Not a JsonLocation value")
        }
        return parsed
    })
}

// Affiche displayName au lieu d'afficher le JSON brut
export function locationDisplayName(value: string): string {
    const parsed = parseLocation(value)
    return parsed.success ? parsed.value.displayName : value
}
