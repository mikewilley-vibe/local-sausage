'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Restaurant {
  name: string;
  address: string;
  distance?: number;
  cuisine: string;
  website?: string;
  rating?: number;
}

export default function RestaurantsPage() {
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCoordinates, setUseCoordinates] = useState(false);
  const [summary, setSummary] = useState('');

  const handleGetLocation = () => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          fetchRestaurants(position.coords.latitude, position.coords.longitude);
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
    await fetchRestaurants(latitude, longitude);
  };

  const fetchRestaurants = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/local-fare?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (response.ok) {
        setRestaurants(data.restaurants || []);
        setSummary(data.summary || '');
        if (!data.restaurants || data.restaurants.length === 0) {
          setError(data.message || 'No restaurants found near this location.');
        }
      } else {
        setError(data.error || 'Failed to fetch restaurants');
      }
    } catch (err) {
      setError('Error fetching restaurants. Please try again.');
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
        await fetchRestaurants(data.coordinates.lat, data.coordinates.lng);
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-6 px-4 py-2 text-amber-700 hover:text-amber-800 font-semibold">
          ← Back to Seasonal Sous Chef
        </Link>
        <h1 className="text-4xl font-bold text-center mb-2 text-amber-700">🍽️ Local Restaurants</h1>
        <p className="text-center text-gray-600 mb-8">Find restaurants near you with seasonal menus</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Location Input Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setUseCoordinates(false)}
                className={`pb-2 px-4 font-medium transition ${
                  !useCoordinates
                    ? 'border-b-2 border-amber-700 text-amber-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Location
              </button>
              <button
                onClick={() => setUseCoordinates(true)}
                className={`pb-2 px-4 font-medium transition ${
                  useCoordinates
                    ? 'border-b-2 border-amber-700 text-amber-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Coordinates
              </button>
            </div>
          </div>

          {!useCoordinates ? (
            <form onSubmit={handleLocationSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City or Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, NY or 40.7128, -74.0060"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                {loading ? 'Searching...' : 'Search Restaurants'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={latitude || ''}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 40.7128"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    value={longitude || ''}
                    onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., -74.0060"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleCoordinateSearch}
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                {loading ? 'Searching...' : 'Find Restaurants'}
              </button>
            </div>
          )}

          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="w-full mt-4 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-200 text-amber-700 font-bold py-2 px-4 rounded-lg transition border border-amber-300"
          >
            📍 Use My Location
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {restaurants.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {summary && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">{summary}</p>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {restaurants.length} Restaurant{restaurants.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="space-y-4">
              {restaurants.map((restaurant, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-700">{restaurant.name}</h3>
                      {restaurant.cuisine && (
                        <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>
                      )}
                    </div>
                    {restaurant.rating && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium whitespace-nowrap ml-2">
                        ⭐ {restaurant.rating.toFixed(1)}
                        {restaurant.reviewCount && (
                          <span className="text-xs text-gray-600 ml-1">({restaurant.reviewCount})</span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{restaurant.address}</p>
                  {restaurant.summary && (
                    <p className="text-gray-700 text-sm mb-3 italic">{restaurant.summary}</p>
                  )}
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-2 items-center">
                      {restaurant.distance && (
                        <span className="text-gray-500 text-sm">
                          📍 {restaurant.distance.toFixed(1)} miles away
                        </span>
                      )}
                      {restaurant.notes && (
                        <span className="text-gray-500 text-xs italic">{restaurant.notes}</span>
                      )}
                    </div>
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 hover:text-amber-800 font-semibold"
                      >
                        Visit →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
