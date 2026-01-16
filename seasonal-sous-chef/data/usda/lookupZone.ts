type ZoneCode = string; // "7a", "8b", etc.

export function lookupUsdaZone(
  lat: number,
  lng: number,
  grid: Record<string, ZoneCode>
): number {
  const round = (n: number) => Math.round(n * 4) / 4; // 0.25° grid
  const key = `${round(lat).toFixed(2)},${round(lng).toFixed(2)}`;

  const zone = grid[key];

  if (!zone) {
    // Fallback: state-based default handled elsewhere
    throw new Error("USDA zone not found");
  }

  // Convert "7a" → 7
  return parseInt(zone[0], 10);
}