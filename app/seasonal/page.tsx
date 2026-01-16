'use client';

import { useState } from 'react';

export default function SeasonalPage() {
  const [searchMode, setSearchMode] = useState<'region' | 'coordinates'>('region');
  const [region, setRegion] = useState('Northeast');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [produce, setProduce] = useState<any>(null);
  const [error, setError] = useState('');

  const regions = [
    'Northeast', 'MidAtlantic', 'Southeast', 'Midwest', 
    'Plains', 'Mountain', 'Southwest', 'West', 'South'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSearch = async () => {
    if (searchMode === 'region' && !region) {
      setError('Please select a region');
      return;
    }
    if (searchMode === 'coordinates' && (!latitude || !longitude)) {
      setError('Please enter valid latitude and longitude');
      return;
    }

    setLoading(true);
    setError('');
    setProduce(null);

    try {
      let url = `/api/seasonal?month=${month}`;
      
      if (searchMode === 'region') {
        url += `&region=${region}`;
      } else {
        url += `&lat=${latitude}&lng=${longitude}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setProduce(data);
      } else {
        setError(data.error || 'Failed to fetch seasonal produce');
      }
    } catch (err) {
      setError('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setSearchMode('coordinates');
          setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-green-700">🍃 What's in Season?</h1>
        <p className="text-center text-gray-600 mb-8">Find seasonal produce by region and month</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Search Mode Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setSearchMode('region')}
                className={`pb-2 px-4 font-medium transition ${
                  searchMode === 'region'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Region
              </button>
              <button
                onClick={() => setSearchMode('coordinates')}
                className={`pb-2 px-4 font-medium transition ${
                  searchMode === 'coordinates'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                By Coordinates
              </button>
            </div>
          </div>

          {searchMode === 'region' ? (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={latitude || ''}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 40.7128"
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
                    placeholder="e.g., -74.0060"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleUseMyLocation}
                disabled={loading}
                className="w-full bg-green-100 hover:bg-green-200 disabled:bg-gray-200 text-green-700 font-bold py-2 px-4 rounded-lg transition border border-green-300"
              >
                📍 Use My Location
              </button>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Searching...' : 'Find Seasonal Produce'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {produce && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{produce.regionLabel} - {months[month - 1]}</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-orange-600">🍎 Fruits</h3>
                {produce.fruits && produce.fruits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {produce.fruits.map((fruit: string) => (
                      <span key={fruit} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        {fruit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No fruits in season</p>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-600">🥬 Vegetables</h3>
                {produce.vegetables && produce.vegetables.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {produce.vegetables.map((veg: string) => (
                      <span key={veg} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {veg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No vegetables in season</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
