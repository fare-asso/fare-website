import { type } from "arktype"

import { createError, useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

import type { LocationSuggestion } from "./types"

// Géoplateforme geocoding API : https://data.geopf.fr/geocodage/openapi
const GEOCODING_URL = "https://data.geopf.fr/geocodage/search"

// Limite de 200 caractères, on est large
const MAX_QUERY_LENGTH = 200

// La feature POI (points d'intérêt) expose `city`/`postcode` sous la
// forme d'un tableau et la feature address sous la forme d'un String,
// donc on accepte les deux.
const GeocodeResponseSchema = type({
    features: type({
        properties: {
            "label?": "string",
            "toponym?": "string",
            "postcode?": "string | string[]",
            "city?": "string | string[]"
        },
        geometry: {
            // GeoJSON Point : [lon, lat], parfois suivi de l'altitude
            coordinates: "number[] >= 2"
        }
    }).array()
})

function firstOf(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

/**
 * An API request which gives autocompletion for an address query.
 */
export const GET = withEvlog(async (request: Request) => {
    const log = useLogger()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.trim()

    if (!query) {
        throw createError({
            status: 400,
            message: "Erreur: Requête nulle",
            why: "Le paramètre `query` est manquant",
            fix: "Fournir un paramètre `query` non vide"
        })
    }

    // The minimum length is set to 3 characters to avoid unnecessary requests
    if (query.length < 3) {
        throw createError({
            status: 400,
            message: "Erreur: Requête trop courte",
            why: "La requête doit contenir au moins 3 caractères",
            fix: "Saisir au moins 3 caractères"
        })
    }

    log.set({ query })

    const url = new URL(GEOCODING_URL)
    url.searchParams.set("q", query.slice(0, MAX_QUERY_LENGTH))
    url.searchParams.set("autocomplete", "1")
    url.searchParams.set("limit", "5")
    url.searchParams.set("index", "address,poi")

    const fetched = await tryCatch(fetch(url))
    if (!fetched.success) {
        throw createError({
            status: 502,
            message: "Internal Server Error",
            why: "Le service de géocodage est injoignable",
            fix: "Réessayer plus tard",
            cause: fetched.error
        })
    }

    if (!fetched.value.ok) {
        throw createError({
            status: 502,
            message: "Internal Server Error",
            why: `Le service de géocodage a répondu ${fetched.value.status}`,
            fix: "Réessayer plus tard"
        })
    }

    const jsonData = await tryCatch(fetched.value.json() as Promise<unknown>)
    if (!jsonData.success) {
        throw createError({
            status: 502,
            message: "Internal Server Error",
            why: "Réponse du service de géocodage illisible",
            fix: "Réessayer plus tard",
            cause: jsonData.error
        })
    }

    const validated = GeocodeResponseSchema(jsonData.value)
    if (validated instanceof type.errors) {
        throw createError({
            status: 502,
            message: "Internal Server Error",
            why: "Réponse du service de géocodage dans un format inattendu",
            fix: "Réessayer plus tard",
            cause: new Error(validated.summary)
        })
    }

    const suggestions: LocationSuggestion[] = []
    for (const feature of validated.features) {
        const { label, toponym, postcode, city } = feature.properties
        // La feature POI n'a pas de label donc on en reconstruit un
        const builtLabel =
            label ??
            [toponym, firstOf(postcode), firstOf(city)]
                .filter(Boolean)
                .join(" ")
        if (!builtLabel) {
            continue
        }
        const [lon, lat] = feature.geometry.coordinates
        suggestions.push({
            label: builtLabel,
            lat: String(lat),
            lon: String(lon)
        })
    }

    log.set({ resultCount: suggestions.length })
    return Response.json(
        { suggestions },
        {
            headers: {
                "Cache-Control": "public, max-age=86400, s-maxage=86400"
            }
        }
    )
})
