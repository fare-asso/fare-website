'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Inter } from "next/font/google";
import L from 'leaflet';
import { Association } from '@prisma/client';
import AssociationMapSearchBar from './associationMapSearchBar';
import { useState, useRef, ChangeEvent } from 'react';

import { createClient } from '@/helpers/supabase/client';

import Image from 'next/image';

const inter = Inter({ subsets: ["latin"] });

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

export default function AssociationMap({ associations } : { associations: Association[] }) {

    const supabase = createClient();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchError, setSearchError] = useState<string | undefined>(undefined);
    const mapRef = useRef<L.Map>(null);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const value = event.target.value;
        setSearchQuery(value);

        const association = associations.find(assoc => assoc.name.toLowerCase().includes(value.toLowerCase()));

        console.log(association)

        if (association) {
            setSearchError(undefined)
            const locationData = processLocationData(association.location);
            if (locationData.json) {
                const { lat, lon } = locationData.json.coordinates;
                if (mapRef.current) {
                    const map = mapRef.current;
                    map.setView([Number(lat), Number(lon)], 14); // Zoom niveau 14 par exemple
                }
            }
        } else {
            setSearchError("Aucune association trouvée.")
        }
    }

    return (
        <MapContainer 
            center={[48.218606757415415, -2.755923596719829]} 
            zoom={8.4} 
            scrollWheelZoom={false} 
            className={"h-[600px] w-[90%] rounded-xl border-[1.5px] border-black mb-20 " + inter.className}
            ref={mapRef}
        >
            <div className='h-20 w-full absolute mt-5 z-[999] hidden md:flex md:flex-col md:justify-start md:items-center'>
                <AssociationMapSearchBar value={searchQuery} onChange={handleSearchChange}/>
                {searchError && <div className="text-white/90 text-center mt-2 rounded-full border-1 bg-black/50 py-1 px-2">{searchError}</div>}
            </div>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {associations.map(association => {

                const locationData = processLocationData(association.location);

                if(locationData.string) {
                    return(null)
                } else if (locationData.json) {
                    return (
                        <Marker key={association.id} position={[Number(locationData.json.coordinates.lat), Number(locationData.json.coordinates.lon)]} alt={association.name}>
                            <Popup>
                                <div className='flex flex-row w-full'>

                                    <Image src={supabase.storage.from('association-pictures').getPublicUrl(association.logoPath).data.publicUrl} width={100} height={100} alt={"Logo de l'association " + association.name}
                                    className='aspect-square object-cover rounded-md'
                                    />
                                    <div className='ml-3'>
                                        <h2 className='text-base font-semibold'>{association.name}</h2>
                                        <p className='text-xs opacity-80'>{locationData.json.displayName}</p>
                                    </div>
                                    
                                </div>
                            </Popup>
                        </Marker>
                    );
                }

            })}
        </MapContainer>
    );
}
