import React, { useState } from 'react';
import { searchPlace } from '../api/routeApi';

interface SidebarProps {
    onFindRoute: () => void;
    onReset: () => void;
    start: [number, number] | null;
    end: [number, number] | null;
    setStart: (coords: [number, number] | null) => void;
    setEnd: (coords: [number, number] | null) => void;
    routeData: any;
    loading: boolean;
    startLocationName: string | null;
    onUseCurrentLocation: () => void;
    locationLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    onFindRoute, onReset, start, end, setStart, setEnd, routeData, loading,
    startLocationName, onUseCurrentLocation, locationLoading
}) => {
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startResults, setStartResults] = useState<any[]>([]);
    const [endResults, setEndResults] = useState<any[]>([]);
    const [routeMode, setRouteMode] = useState<'fast' | 'safe' | 'eco'>('fast');

    const handleSearch = async (query: string, setResults: (res: any[]) => void) => {
        if (!query) return;
        try {
            const results = await searchPlace(query);
            setResults(results);
        } catch (e) {
            console.error(e);
        }
    };

    const selectPlace = (place: any, isStart: boolean) => {
        const coords: [number, number] = [parseFloat(place.lat), parseFloat(place.lon)];
        if (isStart) {
            setStart(coords);
            setStartQuery(place.display_name);
            setStartResults([]);
        } else {
            setEnd(coords);
            setEndQuery(place.display_name);
            setEndResults([]);
        }
    };

    const getStartInputValue = () => {
        if (startQuery) return startQuery;
        if (start && startLocationName) return startLocationName;
        if (start) return `Selected (${start[0].toFixed(4)}, ${start[1].toFixed(4)})`;
        return '';
    };

    return (
        <aside className="panel">
            <header className="panel-header">
                <h1>
                    <span className="icon">🏍️</span>
                    <span>Bike Route Planner</span>
                </h1>
            </header>

            <div className="panel-content">
                <div className="space-y-6">
                    {/* Start Input */}
                    <div className="form-group relative">
                        <label className="form-label">Start point</label>
                        <div className="input-wrapper">
                            <input
                                className="input-field"
                                value={getStartInputValue()}
                                onChange={(e) => {
                                    setStartQuery(e.target.value);
                                    if (start) setStart(null);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(startQuery, setStartResults)}
                                placeholder="Enter start address..."
                            />
                            <button
                                className="btn-icon"
                                onClick={() => handleSearch(startQuery, setStartResults)}
                                title="Search location"
                                aria-label="Search start location"
                            >
                                🔍
                            </button>
                        </div>

                        <button
                            className="btn-location"
                            onClick={onUseCurrentLocation}
                            disabled={locationLoading}
                        >
                            {locationLoading ? 'Getting location...' : '📍 Use My Current Location'}
                        </button>

                        {startResults.length > 0 && (
                            <ul className="search-results">
                                {startResults.map((place: any) => (
                                    <li
                                        key={place.place_id}
                                        className="search-result-item"
                                        onClick={() => selectPlace(place, true)}
                                    >
                                        {place.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Destination Input */}
                    <div className="form-group relative">
                        <label className="form-label">Destination</label>
                        <div className="input-wrapper">
                            <input
                                className="input-field"
                                value={end ? (endQuery || `Selected (${end[0].toFixed(4)}, ${end[1].toFixed(4)})`) : endQuery}
                                onChange={(e) => setEndQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(endQuery, setEndResults)}
                                placeholder="Enter destination..."
                            />
                            <button
                                className="btn-icon"
                                onClick={() => handleSearch(endQuery, setEndResults)}
                                title="Search location"
                                aria-label="Search destination"
                            >
                                🔍
                            </button>
                        </div>

                        {endResults.length > 0 && (
                            <ul className="search-results">
                                {endResults.map((place: any) => (
                                    <li
                                        key={place.place_id}
                                        className="search-result-item"
                                        onClick={() => selectPlace(place, false)}
                                    >
                                        {place.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Route Mode Selector */}
                    <div className="mode-selector">
                        <label className="form-label">Route Preference</label>
                        <div className="mode-options">
                            {(['fast', 'safe', 'eco'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    className={`mode-option ${routeMode === mode ? 'active' : ''}`}
                                    onClick={() => setRouteMode(mode)}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="btn-group">
                        <button
                            className="btn btn-primary"
                            onClick={onFindRoute}
                            disabled={!start || !end || loading}
                        >
                            {loading ? 'Finding route...' : 'Find Route'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                onReset();
                                setStartQuery('');
                                setEndQuery('');
                            }}
                        >
                            Clear
                        </button>
                    </div>

                    {routeData && (
                        <div className="route-info">
                            <h2 className="route-info-title">Route Summary</h2>
                            <div className="route-stats">
                                <div className="stat-card">
                                    <span className="stat-label">Distance</span>
                                    <div className="stat-value">{(routeData.distance / 1000).toFixed(1)} km</div>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Travel Time</span>
                                    <div className="stat-value">{Math.round(routeData.time / 60000)} min</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="panel-footer">
                <p>Click map to set points manually</p>
            </footer>
        </aside>
    );
};

export default Sidebar;
