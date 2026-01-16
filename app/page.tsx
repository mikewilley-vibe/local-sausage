import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">🥕 Seasonal Sous Chef</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Find what's in season near you
        </p>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Link href="/seasonal">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">📍 Seasonal</h2>
              <p className="text-gray-600 mb-4">Find what's in season in your area</p>
              <span className="text-blue-600 font-semibold hover:text-blue-800">Explore →</span>
            </div>
          </Link>
          
          <Link href="/recipes">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">🍳 Recipes</h2>
              <p className="text-gray-600 mb-4">Find recipes using your ingredients</p>
              <span className="text-orange-600 font-semibold hover:text-orange-800">Explore →</span>
            </div>
          </Link>
          
          <Link href="/markets">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">🌾 Markets</h2>
              <p className="text-gray-600 mb-4">Find farmers markets and local sources</p>
              <span className="text-green-600 font-semibold hover:text-green-800">Explore →</span>
            </div>
          </Link>

          <Link href="/restaurants">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">🍽️ Restaurants</h2>
              <p className="text-gray-600 mb-4">Discover restaurants with seasonal menus</p>
              <span className="text-red-600 font-semibold hover:text-red-800">Explore →</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
