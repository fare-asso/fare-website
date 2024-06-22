'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Association } from '@prisma/client';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function AssociationMap({ associations } : { associations: Association[] }) {
    return (
        <MapContainer center={[48.218606757415415, -2.755923596719829]} zoom={8.4} scrollWheelZoom={false} className="h-[600px] w-[90%] rounded-xl border-[1.5px] border-black mb-20">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* {associations.map(association => {
                const [lat, lon] = association.location.split(',').map(coord => parseFloat(coord.trim()));

                return (
                    <Marker key={association.id} position={[lat, lon]}>
                        <Popup>
                            <div>
                                <h2>{association.name}</h2>
                                <p>{association.desc}</p>
                                {association.website && <a href={association.website} target="_blank" rel="noopener noreferrer">Website</a>}
                            </div>
                        </Popup>
                    </Marker>
                );
            })} */}
        </MapContainer>
    );
}
