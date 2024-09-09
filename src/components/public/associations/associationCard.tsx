import { createClient } from "@/helpers/supabase/server";
import { Association } from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { MdLocationPin } from "react-icons/md";

interface JsonLocation {
    displayName: string,
    coordinates: Coordinates
}

interface Coordinates {
    lat: string,
    lon: string
}

function processLocationData(value: string): { json?: JsonLocation, string?: string} {
    try {
        const json = JSON.parse(value);
        return {
            json: json
        }
    } catch {
        return {
            string: value
        }
    }
}

export default function AssociationCard({association}:{ association: Association}) {

    const supabase = createClient();

    const processedLocationData = processLocationData(association.location);

    return (
        <Link href={`/reseau/associations/${association.id}`} className="relative flex flex-col p-4 hover:scale-105 bg-white outline outline-1 outline-black rounded-lg">
            <Image src={supabase.storage.from('association-pictures').getPublicUrl(association.logoPath).data.publicUrl} width={400} height={400} alt={association.name + " logo"}
            className=" rounded-lg border border-black aspect-square object-cover w-full"
            />
            <div className="flex flex-row w-full">
                <div className="flex flex-col mt-2">
                    <span className="font-semibold text-xl">{association.name}</span>
                    <span className="border border-black text-xs px-4 py-[2px] rounded-full text-center font-semibold">{association.major}</span>
                </div>
            </div>
        </Link>
    )
}