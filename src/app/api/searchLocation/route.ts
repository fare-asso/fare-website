import { createError, useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

import type { AutocompleteResponse } from "./types"

/**
 * An API request which gives autocompletion for an address query.
 */
export const GET = withEvlog(async (request: Request) => {
    const log = useLogger()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

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

    // Fetch response from autocompletion service (https://adresse.data.gouv.fr/)
    const fetched = await tryCatch(
        fetch(
            `https://data.geopf.fr/geocodage/completion?text=${encodeURIComponent(query)}&maximumResponses=5`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
    )
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

    const jsonData = await tryCatch(
        fetched.value.json() as Promise<AutocompleteResponse>
    )
    if (!jsonData.success) {
        throw createError({
            status: 502,
            message: "Internal Server Error",
            why: "Réponse du service de géocodage illisible",
            fix: "Réessayer plus tard",
            cause: jsonData.error
        })
    }

    log.set({ resultCount: jsonData.value.results.length })
    return Response.json(jsonData.value)
})
