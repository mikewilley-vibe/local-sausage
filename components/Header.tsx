'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <span className="text-2xl">🍲</span>
          <span className="text-xl font-bold">Seasonal Sous Chef</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/seasonal" className="hover:opacity-80 transition font-medium">
            📍 Seasonal
          </Link>
          <Link href="/recipes" className="hover:opacity-80 transition font-medium">
            🍳 Recipes
          </Link>
          <Link href="/markets" className="hover:opacity-80 transition font-medium">
            🌾 Markets
          </Link>
          <Link href="/restaurants" className="hover:opacity-80 transition font-medium">
            🍽️ Restaurants
          </Link>

          {!isHome && (
            <Link
              href="/"
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              ← Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
