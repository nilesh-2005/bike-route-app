import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface RouteResponse {
    distance: number;      // meters
    time: number;          // milliseconds
    points: [number, number][]; // Array of [lat, lon] tuples
    distanceKm?: number;   // convenience field
    timeMinutes?: number;  // convenience field
}

export interface PlaceResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

/**
 * Fetch a bike route between two coordinates
 */
export const getRoute = async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): Promise<RouteResponse> => {
    try {
        const response = await axios.get<RouteResponse>(`${API_URL}/api/route`, {
            params: {
                fromLat,
                fromLng,
                toLat,
                toLng
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            const msg = typeof data === 'string' ? data : data?.message || 'Failed to fetch route';
            throw new Error(msg);
        }
        throw error;
    }
};

/**
 * Search for a place using Nominatim (OpenStreetMap)
 */
export const searchPlace = async (query: string): Promise<PlaceResult[]> => {
    try {
        const response = await axios.get<PlaceResult[]>('https://nominatim.openstreetmap.org/search', {
            params: {
                q: query,
                format: 'json',
                limit: 5,
                countrycodes: 'in' // Limit to India
            }
        });
        return response.data;
    } catch (error) {
        console.error('Place search failed:', error);
        return [];
    }
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Format time for display
 */
export const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
};

/**
 * Reverse geocode: Get place name from coordinates using Nominatim
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat,
                lon,
                format: 'json'
            }
        });
        return response.data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
        console.error('Reverse geocode failed:', error);
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
};
