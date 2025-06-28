import { AutocompleteResponse } from "./types";

/**
 * An API request which gives autocompletion for an address query.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
        return new Response(
            JSON.stringify({ error: "Erreur: Requête nulle" }),
            {
                status: 400,
            },
        );
    }

    // Validate the query length
    // The minimum length is set to 3 characters to avoid unnecessary requests
    if (query.length < 3) {
        return new Response(
            JSON.stringify({ error: "Erreur: Requête trop courte" }),
            {
                status: 400,
            },
        );
    }

    try {
        // Fetch response from autocompletion service (https://adresse.data.gouv.fr/)
        const autocompleteResponse = await fetch(
            `https://data.geopf.fr/geocodage/completion?text=${encodeURIComponent(query)}&maximumResponses=5`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!autocompleteResponse.ok) {
            throw new Error("Failed to fetch data from Nominatim API");
        }

        const jsonData: AutocompleteResponse =
            await autocompleteResponse.json();

        // Return the results
        return Response.json(jsonData);
    } catch (error) {
        console.error("Error fetching location data:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
            },
        );
    }
}
