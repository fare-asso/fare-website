import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"

import { server } from "@/test/msw"

import { GET } from "../route"
import type { SearchLocationResponse } from "../types"

const GEOCODING_URL = "https://data.geopf.fr/geocodage/search"

function call(query?: string): Promise<Response> {
    const url = new URL("http://localhost:3000/api/searchLocation")
    if (query !== undefined) {
        url.searchParams.set("query", query)
    }
    return GET(new Request(url))
}

describe("GET /api/searchLocation", () => {
    it("rejects a missing query with 400", async () => {
        const res = await call()
        expect(res.status).toBe(400)
    })

    it("rejects a query shorter than 3 characters with 400", async () => {
        const res = await call("ab")
        expect(res.status).toBe(400)
    })

    it("maps address (label) and POI (built label) features", async () => {
        server.use(
            http.get(GEOCODING_URL, () =>
                HttpResponse.json({
                    features: [
                        {
                            properties: {
                                label: "1 Rue de Paris 35000 Rennes"
                            },
                            // GeoJSON Point: [lon, lat]
                            geometry: { coordinates: [-1.6, 48.1] }
                        },
                        {
                            // POI has no `label`: rebuilt from toponym/postcode/city
                            properties: {
                                toponym: "Mairie",
                                postcode: ["35000"],
                                city: ["Rennes"]
                            },
                            geometry: { coordinates: [-1.7, 48.2] }
                        }
                    ]
                })
            )
        )

        const res = await call("rennes")
        expect(res.status).toBe(200)
        const body = (await res.json()) as SearchLocationResponse
        expect(body.suggestions).toEqual([
            { label: "1 Rue de Paris 35000 Rennes", lat: "48.1", lon: "-1.6" },
            { label: "Mairie 35000 Rennes", lat: "48.2", lon: "-1.7" }
        ])
        expect(res.headers.get("Cache-Control")).toContain("max-age=86400")
    })

    it("returns 502 when the geocoding service fails", async () => {
        server.use(
            http.get(
                GEOCODING_URL,
                () => new HttpResponse(null, { status: 500 })
            )
        )
        const res = await call("rennes")
        expect(res.status).toBe(502)
    })
})
