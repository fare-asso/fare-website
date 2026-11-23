import { type } from "arktype"
import type { APIRoute } from "astro"
import {
    createError,
    type ErrorOptions,
    parseError,
    type RequestLogger
} from "evlog"

import type {
    LocationSuggestion,
    SearchLocationResponse
} from "@/helpers/searchLocation"
import { tryCatch } from "@/lib/utils"

// Géoplateforme geocoding API : https://data.geopf.fr/geocodage/openapi
const GEOCODING_URL = "https://data.geopf.fr/geocodage/search"

// Limite de 200 caractères, on est large
const MAX_QUERY_LENGTH = 200

const GeocodeResponseSchema = type({
    features: type({
        properties: { "label?": "string" },
        geometry: {
            // GeoJSON Point : [lon, lat], parfois suivi de l'altitude
            coordinates: "number[] >= 2"
        }
    }).array()
})

function errorResponse(log: RequestLogger, options: ErrorOptions): Response {
    const error = createError(options)
    log.error(error)
    const parsed = parseError(error)
    return Response.json(parsed, { status: parsed.status })
}

export const GET: APIRoute = async ({ request, locals }) => {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.trim()

    if (!query) {
        return errorResponse(locals.log, {
            status: 400,
            message: "Erreur: Requête nulle",
            why: "Le paramètre `query` est manquant",
            fix: "Fournir un paramètre `query` non vide"
        })
    }

    // The minimum length is set to 3 characters to avoid unnecessary requests
    if (query.length < 3) {
        return errorResponse(locals.log, {
            status: 400,
            message: "Erreur: Requête trop courte",
            why: "La requête doit contenir au moins 3 caractères",
            fix: "Saisir au moins 3 caractères"
        })
    }

    locals.log.set({ query })

    const url = new URL(GEOCODING_URL)
    url.searchParams.set("q", query.slice(0, MAX_QUERY_LENGTH))
    url.searchParams.set("autocomplete", "1")
    url.searchParams.set("limit", "5")
    url.searchParams.set("index", "address")

    const fetched = await tryCatch(fetch(url))
    if (!fetched.success) {
        return errorResponse(locals.log, {
            status: 502,
            message: "Internal Server Error",
            why: "Le service de géocodage est injoignable",
            fix: "Réessayer plus tard",
            cause: fetched.error
        })
    }

    if (!fetched.value.ok) {
        return errorResponse(locals.log, {
            status: 502,
            message: "Internal Server Error",
            why: `Le service de géocodage a répondu ${fetched.value.status}`,
            fix: "Réessayer plus tard"
        })
    }

    const jsonData = await tryCatch(fetched.value.json() as Promise<unknown>)
    if (!jsonData.success) {
        return errorResponse(locals.log, {
            status: 502,
            message: "Internal Server Error",
            why: "Réponse du service de géocodage illisible",
            fix: "Réessayer plus tard",
            cause: jsonData.error
        })
    }

    const validated = GeocodeResponseSchema(jsonData.value)
    if (validated instanceof type.errors) {
        return errorResponse(locals.log, {
            status: 502,
            message: "Internal Server Error",
            why: "Réponse du service de géocodage dans un format inattendu",
            fix: "Réessayer plus tard",
            cause: new Error(validated.summary)
        })
    }

    const suggestions: LocationSuggestion[] = []
    for (const feature of validated.features) {
        const { label } = feature.properties
        if (!label) {
            continue
        }
        const [lon, lat] = feature.geometry.coordinates
        suggestions.push({ label, lat: String(lat), lon: String(lon) })
    }

    locals.log.set({ resultCount: suggestions.length })
    return Response.json({ suggestions } satisfies SearchLocationResponse, {
        headers: {
            "Cache-Control": "public, max-age=86400, s-maxage=86400"
        }
    })
}
