import { tryCatch } from "@/lib/utils"

import type { AutocompleteResponse } from "./types"

/**
 * An API request which gives autocompletion for an address query.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
        return new Response(
            JSON.stringify({ error: "Erreur: Requête nulle" }),
            {
                status: 400
            }
        )
    }

    // Validate the query length
    // The minimum length is set to 3 characters to avoid unnecessary requests
    if (query.length < 3) {
        return new Response(
            JSON.stringify({ error: "Erreur: Requête trop courte" }),
            {
                status: 400
            }
        )
    }

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
        console.error("Error fetching location data:", fetched.error)
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        )
    }

    if (!fetched.value.ok) {
        console.error("Error fetching location data: non-OK response")
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        )
    }

    const jsonData = await tryCatch(
        fetched.value.json() as Promise<AutocompleteResponse>
    )
    if (!jsonData.success) {
        console.error("Error parsing location data:", jsonData.error)
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        )
    }

    return Response.json(jsonData.value)
}
