'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Market {
  name: string;
  address: string;
  distance?: number;
  type: string;
  website?: string;
  rating?: number;
}

export default function MarketsPage() {
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [farmerMarkets, setFarmerMarkets] = useState<any[]>([]);
  const [specialtyStores, setSpecialtyStores] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCoordinates, setUseCoordinates] = useState(false);

  const handleGetLocation = () => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          fetchMarkets(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Unable to access your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const handleCoordinateSearch = async () => {
    if (!latitude || !longitude) {
      setError('Please enter valid latitude and longitude');
      return;
    }
    setLoading(true);
    setError('');
    await fetchMarkets(latitude, longitude);
  };

  const fetchMarkets = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/markets?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (response.ok) {
        // Check if we have the new format with farmers_markets and specialty_food_stores
        if (data.farmers_markets || data.specialty_food_stores) {
          setFarmerMarkets(data.farmers_markets || []);
          setSpecialtyStores(data.specialty_food_stores || []);
          setSummary(data.summary || '');
          // Also set combined list for backward compatibility
          const combined = [...(data.farmers_markets || []), ...(data.specialty_food_stores || [])];
          setMarkets(combined);
          if (combined.length === 0 && data.message) {
            setError(data.message);
          }
        } else {
          // Fallback to old format
          setMarkets(data.markets || []);
          if (!data.markets || data.markets.length === 0) {
            setError('No markets found near this location.');
          }
        }
      } else {
        setError(data.error || 'Failed to fetch markets');
      }
    } catch (err) {
      setError('Error fetching markets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to geocode the location
      const response = await fetch(`/api/geo?location=${encodeURIComponent(location)}`);
      const data = await response.json();

      if (response.ok && data.coordinates) {
        await fetchMarkets(data.coordinates.lat, data.coordinates.lng);
        setLatitude(data.coordinates.lat);
        setLongitude(data.coordinates.lng);
      } else {
        setError('Location not found. Try entering coordinates instead.');
        setLoading(false);
      }
    } catch (err) {
      setError('Error geocoding location. Try entering coordinates.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-6 px-4 py-2 text-green-600 hover:text-green-700 font-semibold">
          ← Back to Seasonal Sous Chef
        </Link>
        <h1 className="text-4xl font-bold text-center mb-2 text-green-700">🌾 Local Markets</h1>
        <p className="text-center text-gray-600 mb-8">Find farmers markets and local produce near you</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Location Input Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setUseCoordinates(false)}
                className={`pb-2 px-4 font-medium transition ${
                  !useCoordinates
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Location
              </button>
              <button
                onClick={() => setUseCoordinates(true)}
                className={`pb-2 px-4 font-medium transition ${
                  useCoordinates
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Coordinates
              </button>
            </div>
          </div>

          {!useCoordinates ? (
            <form onSubmit={handleLocationSearch} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter City or Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Portland, OR"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    Search
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">or</p>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loading}
                className="w-full bg-green-100 hover:bg-green-200 disabled:bg-gray-200 text-green-700 font-bold py-2 px-4 rounded-lg transition border border-green-300"
              >
                📍 Use My Current Location
              </button>
            </form>
          ) : (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g., 45.5152"
                  step="0.0001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g., -122.6762"
                  step="0.0001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleCoordinateSearch}
                disabled={loading || !latitude || !longitude}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Loading Markets...' : 'Find Markets'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Markets Display */}
        {(farmerMarkets.length > 0 || specialtyStores.length > 0) && (
          <div className="space-y-8">
            {summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">{summary}</p>
              </div>
            )}

            {farmerMarkets.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-4">🌾 Farmers Markets ({farmerMarkets.length})</h2>
                <div className="space-y-4">
                  {farmerMarkets.map((market, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-green-700">{market.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{market.address}</p>
                      <div className="flex items-center gap-4">
                        {market.distance && (
                          <span className="text-gray-500 text-sm">
                            📍 {market.distance.toFixed(1)} miles away
                          </span>
                        )}
                        {market.notes && (
                          <span className="text-gray-600 text-sm italic">{market.notes}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {specialtyStores.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-amber-700 mb-4">🏪 Specialty Food Stores ({specialtyStores.length})</h2>
                <div className="space-y-4">
                  {specialtyStores.map((store, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md border-l-4 border-amber-500 p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-amber-700">{store.name}</h3>
                          {store.type && (
                            <p className="text-gray-600 text-sm mt-1 capitalize">{store.type}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{store.address}</p>
                      <div className="flex items-center gap-4">
                        {store.distance && (
                          <span className="text-gray-500 text-sm">
                            📍 {store.distance.toFixed(1)} miles away
                          </span>
                        )}
                        {store.notes && (
                          <span className="text-gray-600 text-sm italic">{store.notes}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for old format */}
        {markets.length > 0 && farmerMarkets.length === 0 && specialtyStores.length === 0 && (
          <div className="space-y-4">
            {markets.map((market, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-green-700">{market.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{market.address}</p>
                  </div>
                  {market.rating && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2">
                      ⭐ {market.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      {market.type?.replace('_', ' ').toUpperCase()}
                    </span>
                    {market.distance && (
                      <span className="text-gray-500 text-sm">
                        📍 {market.distance.toFixed(1)} miles
                      </span>
                    )}
                  </div>
                  {market.website && (
                    <a
                      href={market.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-semibold"
                    >
                      Visit →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Finding markets near you...</p>
          </div>
        )}

        {!loading && markets.length === 0 && !error && (
          <div className="text-center py-12 text-gray-600">
            <p>Enter a location to find nearby markets</p>
          </div>
        )}
      </div>
    </div>
  );
}
