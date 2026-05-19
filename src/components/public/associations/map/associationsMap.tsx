"use client"

import type { Association } from "@prisma/client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Inter } from "next/font/google"
import Image from "next/image"
import { type ChangeEvent, useRef, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import { createClient } from "@/helpers/supabase/client"

import AssociationMapSearchBar from "./associationMapSearchBar"

const inter = Inter({ subsets: ["latin"] })

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
})

interface JsonLocation {
    displayName: string
    coordinates: Coordinates
}

interface Coordinates {
    lat: string
    lon: string
}

function processLocationData(value: string): {
    json?: JsonLocation
    string?: string
} {
    try {
        const json = JSON.parse(value)
        return {
            json: json
        }
    } catch {
        return {
            string: value
        }
    }
}

export default function AssociationMap({
    associations
}: {
    associations: Association[]
}) {
    const supabase = createClient()

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [searchError, setSearchError] = useState<string | undefined>(
        undefined
    )
    const mapRef = useRef<L.Map>(null)

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()

        const value = event.target.value
        setSearchQuery(value)

        const association = associations.find((assoc) =>
            assoc.name.toLowerCase().includes(value.toLowerCase())
        )

        console.log(association)

        if (association) {
            setSearchError(undefined)
            const locationData = processLocationData(association.location)
            if (locationData.json) {
                const { lat, lon } = locationData.json.coordinates
                if (mapRef.current) {
                    const map = mapRef.current
                    map.setView([Number(lat), Number(lon)], 14) // Zoom niveau 14 par exemple
                }
            }
        } else {
            setSearchError("Aucune association trouvée.")
        }
    }

    return (
        <MapContainer
            center={[48.28842852181882, -2.1546832933080085]}
            zoom={9}
            scrollWheelZoom={false}
            className={
                "h-[400px] w-full rounded-xl border-[1.5px] border-black md:h-[600px]" +
                inter.className
            }
            ref={mapRef}
        >
            <div className="absolute z-999 mt-5 hidden h-20 w-full md:flex md:flex-col md:items-center md:justify-start">
                <AssociationMapSearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {searchError && (
                    <div className="mt-2 rounded-full border bg-black/50 px-2 py-1 text-center text-white/90">
                        {searchError}
                    </div>
                )}
            </div>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {associations.map((association) => {
                const locationData = processLocationData(association.location)

                if (locationData.string) {
                    return null
                }

                if (locationData.json) {
                    return (
                        <Marker
                            key={association.id}
                            position={[
                                Number(locationData.json.coordinates.lat),
                                Number(locationData.json.coordinates.lon)
                            ]}
                            alt={association.name}
                        >
                            <Popup>
                                <div className="flex w-full flex-row">
                                    <Image
                                        src={
                                            supabase.storage
                                                .from("association-pictures")
                                                .getPublicUrl(
                                                    association.logoPath
                                                ).data.publicUrl
                                        }
                                        width={100}
                                        height={100}
                                        alt={
                                            "Logo de l'association " +
                                            association.name
                                        }
                                        className="aspect-square rounded-md object-cover"
                                    />
                                    <div className="ml-3">
                                        <h2 className="text-base font-semibold">
                                            {association.name}
                                        </h2>
                                        <p className="text-xs opacity-80">
                                            {locationData.json.displayName}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                }

                return null
            })}
        </MapContainer>
    )
}
