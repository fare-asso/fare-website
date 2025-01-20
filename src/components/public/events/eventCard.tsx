"use client";

import { Category, Event } from "@prisma/client";
import Image from "next/image";

import { format } from "date-fns";

import { MdLocationPin } from "react-icons/md";
import Link from "next/link";

interface JsonLocation {
    displayName: string;
    coordinates: Coordinates;
}

interface Coordinates {
    lat: string;
    lon: string;
}

function processLocationData(value: string): {
    json?: JsonLocation;
    string?: string;
} {
    try {
        const json = JSON.parse(value);
        return {
            json: json,
        };
    } catch {
        return {
            string: value,
        };
    }
}

export default function EventCard({
    event,
    archive,
    imageUrl,
}: {
    event: Event & { category: { name: string } };
    archive: boolean;
    imageUrl: string;
}) {
    const fontColor: string = archive ? "#2B2B2B" : "#FFDAA5";
    const backgroundColor: string = archive ? "#C5C5C5" : "#E0832E";

    const location: { json?: JsonLocation; string?: string } =
        processLocationData(event.location);

    return (
        <div
            className={`h-32 lg:h-44 rounded-xl w-full md:w-2/3 lg:w-1/2 p-2 flex flex-row`}
            style={{ backgroundColor }}
        >
            <Image
                src={imageUrl}
                width={600}
                height={400}
                alt={`Photo de l'évènement ${event.name}`}
                className="rounded-md object-cover h-full w-1/3 lg:w-1/4"
            />

            <div className="w-2/3 md:w-1/4 flex flex-col items-start pl-2 mr-4">
                {/* Title */}
                <span
                    className={`font-semibold text-xl`}
                    style={{ color: fontColor }}
                >
                    {event.name}
                </span>
                {/* Category */}
                <div
                    className={`rounded-full text-center px-4 text-sm`}
                    style={{
                        backgroundColor: fontColor,
                        color: backgroundColor,
                    }}
                >
                    {event.category.name}
                </div>
                {/* Date */}
                <div
                    className="rounded-full px-2 outline outline-1 text-sm text-center mt-2 text-balance"
                    style={{ outlineColor: fontColor, color: fontColor }}
                >
                    {`${format(event.startTime, "dd/MM/yy")} au ${format(event.endTime, "dd/MM/yy")}`}
                </div>
                {/* Location */}
                <div
                    className="flex flex-row items-end w-full justify-start"
                    style={{ color: fontColor }}
                >
                    <MdLocationPin size={20} className="min-w-4 min-h-4" />
                    <span className="text-nowrap text-ellipsis overflow-hidden text-sm mt-1">
                        {location.json
                            ? location.json.displayName.split(",")[0]
                            : location.string!.split(",")[0]}
                    </span>
                </div>
            </div>

            <div className="hidden md:flex text-white p-1 flex-1 flex-col items-center">
                {/* Description */}
                <p
                    className="line-clamp-3 h-1/2 flex-1 text-ellipsis"
                    style={{
                        color: archive ? fontColor : "white",
                        opacity: archive ? 0.9 : 1,
                    }}
                >
                    {event.desc}
                </p>

                <div className="w-full h-1/2 flex flex-col items-center justify-center">
                    <Link
                        href={`/evenements/${event.id}`}
                        className="px-4 py-1 text-center text font-semibold rounded-full mt-1 transition-all outline hover:outline-2"
                        style={{
                            backgroundColor: fontColor,
                            color: backgroundColor,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                backgroundColor;
                            e.currentTarget.style.color = fontColor;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = fontColor;
                            e.currentTarget.style.color = backgroundColor;
                        }}
                    >
                        En savoir +
                    </Link>
                </div>
            </div>
        </div>
    );
}
