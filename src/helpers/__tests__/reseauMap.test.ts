import { describe, expect, it } from "vitest"

import { buildReseauMap, departementOf } from "@/helpers/reseauMap"

const loc = (lat: number, lon: number): string =>
    JSON.stringify({
        displayName: "peu importe",
        coordinates: { lat: String(lat), lon: String(lon) }
    })

const RENNES: [number, number] = [48.114, -1.681]
const VILLEJEAN: [number, number] = [48.121, -1.703]
const BEAULIEU: [number, number] = [48.117, -1.638]
const SAINT_BRIEUC: [number, number] = [48.514, -2.765]
const VANNES: [number, number] = [47.658, -2.761]
const JAVENE: [number, number] = [48.32, -1.19]

describe("departementOf", () => {
    it("finds the département containing a point", () => {
        expect(departementOf(...RENNES)).toBe("35")
        expect(departementOf(...SAINT_BRIEUC)).toBe("22")
        expect(departementOf(...VANNES)).toBe("56")
    })

    it("returns null outside the known départements", () => {
        expect(departementOf(48.857, 2.352)).toBeNull() // Paris
        expect(departementOf(48.3, -6)).toBeNull() // en mer
    })
})

describe("buildReseauMap", () => {
    it("covers the départements where associations are located", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) },
            { id: 2, name: "B", location: loc(...SAINT_BRIEUC) }
        ])
        expect(map.covered).toEqual(["22", "35"])
        expect(map.coveredPath.startsWith("M")).toBe(true)
        expect(map.contextPath.endsWith("Z")).toBe(true)
    })

    it("extends coverage and the frame when a new département appears", () => {
        const base = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) }
        ])
        const wide = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) },
            { id: 2, name: "B", location: loc(...VANNES) }
        ])
        expect(base.covered).toEqual(["35"])
        expect(wide.covered).toEqual(["35", "56"])
        expect(wide.height).not.toBe(base.height)
        const vannes = wide.clusters.find((c) => c.city === "Vannes")
        expect(vannes).toBeDefined()
        expect(vannes!.y).toBeGreaterThan(0)
        expect(vannes!.y).toBeLessThan(wide.height)
    })

    it("falls back to 22 + 35 when no association has coordinates", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: "adresse en texte libre" }
        ])
        expect(map.covered).toEqual(["22", "35"])
        expect(map.clusters).toEqual([])
    })

    it("merges nearby campuses into one cluster named after the city", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...VILLEJEAN) },
            { id: 2, name: "B", location: loc(...BEAULIEU) },
            { id: 3, name: "C", location: loc(...SAINT_BRIEUC) }
        ])
        expect(map.clusters).toHaveLength(2)
        const rennes = map.clusters.find((c) => c.city === "Rennes")
        expect(rennes?.count).toBe(2)
        expect(rennes?.assos).toEqual([
            { id: 1, name: "A" },
            { id: 2, name: "B" }
        ])
        expect(map.clusters.find((c) => c.city === "Saint-Brieuc")?.count).toBe(
            1
        )
    })

    it("tints Finistère separately for the Fédé B while it is not covered", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) },
            { id: 2, name: "B", location: loc(...SAINT_BRIEUC) }
        ])
        expect(map.fedeB).not.toBeNull()
        expect(map.fedeB!.path.startsWith("M")).toBe(true)
        expect(map.fedeB!.x).toBeGreaterThan(0)
        expect(map.fedeB!.x).toBeLessThan(map.width)
        expect(map.fedeB!.y).toBeGreaterThan(0)
        expect(map.fedeB!.y).toBeLessThan(map.height)
    })

    it("drops the Fédé B tint when the frame does not reach it", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) }
        ])
        expect(map.fedeB).toBeNull()
    })

    it("drops the Fédé B tint if Finistère becomes covered", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(48.39, -4.49) }
        ])
        expect(map.covered).toContain("29")
        expect(map.fedeB).toBeNull()
    })

    it("skips non-finite coordinates", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) },
            {
                id: 2,
                name: "B",
                location: JSON.stringify({
                    displayName: "x",
                    coordinates: { lat: "Infinity", lon: "1e999" }
                })
            },
            {
                id: 3,
                name: "C",
                location: JSON.stringify({
                    displayName: "x",
                    coordinates: { lat: "", lon: "" }
                })
            }
        ])
        expect(map.covered).toEqual(["35"])
        expect(map.clusters).toHaveLength(1)
    })

    it("drops clusters that fall outside the mapped frame", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...RENNES) },
            { id: 2, name: "B", location: loc(48.857, 2.352) } // Paris
        ])
        expect(map.covered).toEqual(["35"])
        expect(map.clusters).toHaveLength(1)
        expect(map.clusters[0].city).toBe("Rennes")
    })

    it("names a cluster after the nearest known city", () => {
        const map = buildReseauMap([
            { id: 5, name: "ADEAF", location: loc(...JAVENE) }
        ])
        expect(map.clusters[0].city).toBe("Fougères")
    })

    it("sorts clusters by size descending and skips invalid rows", () => {
        const map = buildReseauMap([
            { id: 1, name: "A", location: loc(...SAINT_BRIEUC) },
            { id: 2, name: "B", location: loc(...RENNES) },
            {
                id: 3,
                name: "C",
                location: JSON.stringify({
                    displayName: "x",
                    coordinates: { lat: "abc", lon: "-1.7" }
                })
            },
            { id: 4, name: "D", location: loc(...RENNES) }
        ])
        expect(map.clusters.map((c) => c.city)).toEqual([
            "Rennes",
            "Saint-Brieuc"
        ])
        expect(map.clusters[0].assos).toEqual([
            { id: 2, name: "B" },
            { id: 4, name: "D" }
        ])
    })
})
