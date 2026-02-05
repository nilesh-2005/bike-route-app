import { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { getRoute, reverseGeocode } from './api/routeApi';
import type { RouteResponse } from './api/routeApi';

function App() {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current location state
  const [startLocationName, setStartLocationName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Auto-detect current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setStart([latitude, longitude]);

          try {
            const name = await reverseGeocode(latitude, longitude);
            setStartLocationName(name);
          } catch (e) {
            setStartLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setLocationLoading(false);
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStart([latitude, longitude]);

        try {
          const name = await reverseGeocode(latitude, longitude);
          setStartLocationName(name);
        } catch (e) {
          setStartLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocationLoading(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!start) {
      setStart([lat, lng]);
      setStartLocationName(null);
      setError(null);
    } else if (!end) {
      setEnd([lat, lng]);
      setError(null);
    } else {
      setStart([lat, lng]);
      setStartLocationName(null);
      setEnd(null);
      setRouteData(null);
      setError(null);
    }
  };

  const handleFindRoute = async () => {
    if (!start || !end) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getRoute(start[0], start[1], end[0], end[1]);
      setRouteData(data);
    } catch (err) {
      console.error("Failed to fetch route", err);
      const msg = err instanceof Error ? err.message : "Failed to find route. Please try different points.";
      setError(msg);
      // We keep the alert for critical failures, but error-toast will now be styled via index.css
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStart(null);
    setEnd(null);
    setRouteData(null);
    setError(null);
    setStartLocationName(null);
  };

  return (
    <div className="app-layout">
      <Sidebar
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        onFindRoute={handleFindRoute}
        onReset={handleReset}
        routeData={routeData}
        loading={loading}
        startLocationName={startLocationName}
        onUseCurrentLocation={handleUseCurrentLocation}
        locationLoading={locationLoading}
      />

      <main className="map-container">
        {/* Error toast - Uses design system classes */}
        {error && (
          <div className="error-toast">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        <MapComponent
          start={start}
          end={end}
          routePoints={routeData?.points || null}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  );
}

export default App;
