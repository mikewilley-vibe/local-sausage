import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">🥕 Seasonal Sous Chef</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Find what's in season near you
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/seasonal">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">📍 By Location</h2>
              <p className="text-gray-600 mb-4">Get seasonal produce based on your USDA hardiness zone or region</p>
              <span className="text-blue-600 font-semibold hover:text-blue-800">Explore →</span>
            </div>
          </Link>
          
          <Link href="/recipes">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">🍳 Recipes</h2>
              <p className="text-gray-600 mb-4">AI-generated recipes using seasonal ingredients</p>
              <span className="text-orange-600 font-semibold hover:text-orange-800">Explore →</span>
            </div>
          </Link>
          
          <Link href="/markets">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">🌍 Local Markets</h2>
              <p className="text-gray-600 mb-4">Find farmers markets and local sources nearby</p>
              <span className="text-green-600 font-semibold hover:text-green-800">Explore →</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">API Endpoints</h3>
          <ul className="space-y-2 text-gray-600">
            <li><code className="bg-gray-100 px-2 py-1 rounded">/api/seasonal?region=Northeast&month=6</code></li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/api/seasonal?lat=40.7128&lng=-74.0060&month=8</code></li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/api/recipes</code> - POST with seasonal items</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/api/markets?lat=40.7128&lng=-74.0060</code></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
