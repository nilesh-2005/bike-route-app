import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom flat markers using SVG
const createMarkerIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C16 17.5 19 14.2188 19 10.5C19 6.63401 15.866 3.5 12 3.5C8.13401 3.5 5 6.63401 5 10.5C5 14.2188 8 17.5 12 21Z" fill="${color}" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="10.5" r="2.5" fill="white"/>
               </svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
};

const startIcon = createMarkerIcon('#2d6a4f'); // Green for start
const endIcon = createMarkerIcon('#dc3545');   // Red for end

interface MapComponentProps {
    start: [number, number] | null;
    end: [number, number] | null;
    routePoints: [number, number][] | null;
    onMapClick: (lat: number, lng: number) => void;
}

// Sub-component to handle map clicks
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Sub-component to handle automatic fit bounds
function FitBounds({ routePoints }: { routePoints: [number, number][] | null }) {
    const map = useMap();

    useEffect(() => {
        if (routePoints && routePoints.length > 0) {
            const bounds = L.latLngBounds(routePoints);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routePoints, map]);

    return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ start, end, routePoints, onMapClick }) => {
    // Default center (India/Jaipur based on user screenshots)
    const [center] = useState<[number, number]>([26.9124, 75.7873]);

    return (
        <div className="map-container overflow-hidden">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                zoomControl={true}
                className="w-full h-full"
            >
                {/* Standard OSM Tiles with muted attribution */}
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEvents onClick={onMapClick} />
                <FitBounds routePoints={routePoints} />

                {/* Markers */}
                {start && (
                    <Marker position={start} icon={startIcon} />
                )}
                {end && (
                    <Marker position={end} icon={endIcon} />
                )}

                {/* Route Polyline - Solid color as requested */}
                {routePoints && (
                    <Polyline
                        positions={routePoints}
                        color="#3b82f6"
                        weight={5}
                        opacity={0.8}
                        lineJoin="round"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
