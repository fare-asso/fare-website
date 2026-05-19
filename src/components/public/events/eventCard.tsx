"use client"

import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { MdLocationPin } from "react-icons/md"

import type { Event } from "@/generated/prisma/client"

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

export default function EventCard({
    event,
    archive,
    imageUrl
}: {
    event: Event & { category: { name: string } }
    archive: boolean
    imageUrl: string
}) {
    const fontColor: string = archive ? "#2B2B2B" : "#FFDAA5"
    const backgroundColor: string = archive ? "#C5C5C5" : "#E0832E"

    const location: { json?: JsonLocation; string?: string } =
        processLocationData(event.location)

    return (
        <div
            className="flex h-32 w-full flex-row rounded-xl p-2 md:w-2/3 lg:h-44 lg:w-1/2"
            style={{ backgroundColor }}
        >
            <Image
                src={imageUrl}
                width={600}
                height={400}
                alt={`Photo de l'évènement ${event.name}`}
                className="h-full w-1/3 rounded-md object-cover lg:w-1/4"
            />

            <div className="mr-4 flex w-2/3 flex-col items-start pl-2 md:w-1/4">
                {/* Title */}
                <span
                    className="text-xl font-semibold"
                    style={{ color: fontColor }}
                >
                    {event.name}
                </span>
                {/* Category */}
                <div
                    className="rounded-full px-4 text-center text-sm"
                    style={{
                        backgroundColor: fontColor,
                        color: backgroundColor
                    }}
                >
                    {event.category.name}
                </div>
                {/* Date */}
                <div
                    className="mt-2 rounded-full px-2 text-center text-sm text-balance outline outline-1"
                    style={{ outlineColor: fontColor, color: fontColor }}
                >
                    {`${format(event.startTime, "dd/MM/yy")} au ${format(event.endTime, "dd/MM/yy")}`}
                </div>
                {/* Location */}
                <div
                    className="flex w-full flex-row items-end justify-start"
                    style={{ color: fontColor }}
                >
                    <MdLocationPin size={20} className="min-h-4 min-w-4" />
                    <span className="mt-1 overflow-hidden text-sm text-nowrap text-ellipsis">
                        {location.json
                            ? location.json.displayName.split(",")[0]
                            : location.string?.split(",")[0]}
                    </span>
                </div>
            </div>

            <div className="hidden flex-1 flex-col items-center p-1 text-white md:flex">
                {/* Description */}
                <p
                    className="line-clamp-3 h-1/2 flex-1 text-ellipsis"
                    style={{
                        color: archive ? fontColor : "white",
                        opacity: archive ? 0.9 : 1
                    }}
                >
                    {event.desc}
                </p>

                <div className="flex h-1/2 w-full flex-col items-center justify-center">
                    <Link
                        href={`/evenements/${event.id}`}
                        className="text mt-1 rounded-full px-4 py-1 text-center font-semibold outline transition-all hover:outline-2"
                        style={{
                            backgroundColor: fontColor,
                            color: backgroundColor
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                backgroundColor
                            e.currentTarget.style.color = fontColor
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = fontColor
                            e.currentTarget.style.color = backgroundColor
                        }}
                    >
                        En savoir +
                    </Link>
                </div>
            </div>
        </div>
    )
}
