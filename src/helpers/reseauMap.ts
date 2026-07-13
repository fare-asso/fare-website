import geo from "@/assets/geo/departements.json"
import { parseLocation } from "@/helpers/location"

// Contours de départements (france-geojson, données IGN, licence ouverte
// Etalab), simplifiés pour un rendu SVG stylisé, indexés par code.
const departements = geo as unknown as Record<string, [number, number][][]>

const MAP_WIDTH = 1000

// marges autour des départements couverts, pour laisser apparaître les
// voisins sur les bords ; larges en longitude et serrées en latitude
// pour garder une carte panoramique
const PAD_LON = 0.55
const PAD_LAT = 0.12

// Départements historiques du réseau, utilisés quand aucune association
// n'a de coordonnées exploitables.
const DEFAULT_COVERED = ["22", "35"]

// rayon de regroupement des associations (les campus d'une même ville
// fusionnent) et distance maximale pour nommer un groupe d'après la
// ville connue la plus proche
const CLUSTER_KM = 12
const CITY_KM = 30

const CITIES: [string, number, number][] = [
    ["Rennes", 48.114, -1.681],
    ["Saint-Brieuc", 48.514, -2.765],
    ["Saint-Malo", 48.649, -2.026],
    ["Fougères", 48.352, -1.199],
    ["Vitré", 48.124, -1.213],
    ["Redon", 47.652, -2.083],
    ["Dinan", 48.455, -2.045],
    ["Guingamp", 48.563, -3.151],
    ["Lannion", 48.732, -3.459],
    ["Vannes", 47.658, -2.761],
    ["Lorient", 47.748, -3.366],
    ["Pontivy", 48.069, -2.963],
    ["Brest", 48.39, -4.486],
    ["Quimper", 47.996, -4.102],
    ["Nantes", 47.218, -1.554],
    ["Laval", 48.073, -0.77]
]

function distanceKm(
    latA: number,
    lonA: number,
    latB: number,
    lonB: number
): number {
    const midLat = ((latA + latB) / 2) * (Math.PI / 180)
    return Math.hypot(
        (latA - latB) * 111,
        (lonA - lonB) * 111 * Math.cos(midLat)
    )
}

function pointInRing(
    lat: number,
    lon: number,
    ring: [number, number][]
): boolean {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [lonI, latI] = ring[i]
        const [lonJ, latJ] = ring[j]
        if (
            latI > lat !== latJ > lat &&
            lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI
        ) {
            inside = !inside
        }
    }
    return inside
}

export function departementOf(lat: number, lon: number): string | null {
    for (const [code, rings] of Object.entries(departements)) {
        if (rings.some((ring) => pointInRing(lat, lon, ring))) return code
    }
    return null
}

function nearestCity(lat: number, lon: number): string | null {
    let best: string | null = null
    let bestKm = CITY_KM
    for (const [name, cityLat, cityLon] of CITIES) {
        const km = distanceKm(lat, lon, cityLat, cityLon)
        if (km < bestKm) {
            best = name
            bestKm = km
        }
    }
    return best
}

const round = (n: number): number => Math.round(n * 10) / 10

interface CityCluster {
    x: number
    y: number
    count: number
    city: string | null
    names: string[]
}

export interface ReseauMap {
    width: number
    height: number
    covered: string[]
    coveredPath: string
    contextPath: string
    clusters: CityCluster[]
}

export function buildReseauMap(
    associations: { name: string; location: string }[]
): ReseauMap {
    // 1. coordonnées exploitables uniquement ; les autres associations
    // sont ignorées jusqu'à correction de leur adresse
    const points: { name: string; lat: number; lon: number }[] = []
    for (const asso of associations) {
        const parsed = parseLocation(asso.location)
        if (!parsed.success) continue
        const lat = Number(parsed.value.coordinates.lat)
        const lon = Number(parsed.value.coordinates.lon)
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue
        points.push({ name: asso.name, lat, lon })
    }

    // 2. départements couverts : ceux qui contiennent au moins un point
    const covered = new Set<string>()
    for (const point of points) {
        const code = departementOf(point.lat, point.lon)
        if (code) covered.add(code)
    }
    if (covered.size === 0) {
        for (const code of DEFAULT_COVERED) covered.add(code)
    }

    // 3. cadrage et projection sur les départements couverts
    let minLon = Infinity
    let maxLon = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity
    for (const code of covered) {
        for (const ring of departements[code]) {
            for (const [lon, lat] of ring) {
                if (lon < minLon) minLon = lon
                if (lon > maxLon) maxLon = lon
                if (lat < minLat) minLat = lat
                if (lat > maxLat) maxLat = lat
            }
        }
    }
    minLon -= PAD_LON
    maxLon += PAD_LON
    minLat -= PAD_LAT
    maxLat += PAD_LAT

    // équirectangulaire corrigée : le rapport largeur/hauteur tient
    // compte de la latitude moyenne pour ne pas aplatir la région
    const midLat = (minLat + maxLat) / 2
    const lonScale = Math.cos((midLat * Math.PI) / 180)
    const height = Math.round(
        (MAP_WIDTH * (maxLat - minLat)) / ((maxLon - minLon) * lonScale)
    )
    const project = (lat: number, lon: number): { x: number; y: number } => ({
        x: ((lon - minLon) / (maxLon - minLon)) * MAP_WIDTH,
        y: ((maxLat - lat) / (maxLat - minLat)) * height
    })
    const toPath = (codes: string[]): string =>
        codes
            .flatMap((code) => departements[code])
            .map((ring) => {
                const pts = ring.map(([lon, lat]) => {
                    const { x, y } = project(lat, lon)
                    return `${round(x)},${round(y)}`
                })
                return `M${pts.join("L")}Z`
            })
            .join("")

    // 4. regroupement par proximité géographique
    const groups: {
        lats: number[]
        lons: number[]
        names: string[]
        lat: number
        lon: number
    }[] = []
    for (const point of points) {
        const group = groups.find(
            (g) => distanceKm(point.lat, point.lon, g.lat, g.lon) <= CLUSTER_KM
        )
        if (group) {
            group.lats.push(point.lat)
            group.lons.push(point.lon)
            group.names.push(point.name)
            group.lat =
                group.lats.reduce((s, v) => s + v, 0) / group.lats.length
            group.lon =
                group.lons.reduce((s, v) => s + v, 0) / group.lons.length
        } else {
            groups.push({
                lats: [point.lat],
                lons: [point.lon],
                names: [point.name],
                lat: point.lat,
                lon: point.lon
            })
        }
    }
    const clusters = groups
        .map((group) => {
            const { x, y } = project(group.lat, group.lon)
            return {
                x: round(x),
                y: round(y),
                count: group.names.length,
                city: nearestCity(group.lat, group.lon),
                names: group.names
            }
        })
        .sort((a, b) => b.count - a.count)

    return {
        width: MAP_WIDTH,
        height,
        covered: [...covered].sort(),
        coveredPath: toPath([...covered]),
        contextPath: toPath(
            Object.keys(departements).filter((code) => !covered.has(code))
        ),
        clusters
    }
}
