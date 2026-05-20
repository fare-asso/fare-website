import { tryCatch } from "@/lib/utils"

export interface JsonLocation {
    displayName: string
    coordinates: { lat: string; lon: string }
}

/**
 * Parse a stored `location` field (Event / Association rows).
 *
 * The value is either a JSON-encoded `JsonLocation` written by the
 * location picker, or a plain-text address typed directly by a user.
 * Returns a Rust-style Result so callers can narrow on `.success` and
 * pick their own fallback (short label, full address, map marker, …).
 *
 * The JSON shape is trusted — the picker is the only writer — so the
 * cast to `JsonLocation` is not re-validated here.
 */
export function parseLocation(value: string) {
    return tryCatch<JsonLocation>(() => JSON.parse(value) as JsonLocation)
}
