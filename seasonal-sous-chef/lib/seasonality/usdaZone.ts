import zones from "@/data/usda/zones_by_lat_lng.json";
import produce from "@/data/seasonality/produce_by_zone_month.json";

function lookupZone(
  lat: number,
  lng: number,
  zones: Record<string, { lat: number; lng: number; zone: string }[]>
): string {
  let closestZone = "5b";
  let closestDistance = Infinity;

  for (const [zone, coordinates] of Object.entries(zones)) {
    for (const coord of coordinates) {
      const distance = Math.sqrt(
        Math.pow(coord.lat - lat, 2) + Math.pow(coord.lng - lng, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZone = zone;
      }
    }
  }

  return closestZone;
}

export function getUsdaZoneSeasonality({
  lat,
  lng,
  month,
}: {
  lat?: number;
  lng?: number;
  month: number;
}) {
  if (!lat || !lng) throw new Error("Lat/lng required");

  const zone = lookupZone(lat, lng, zones as any);
  const key = `${zone}-${month}`;
  const entry = (produce as any)[key];

  return {
    regionLabel: `USDA Zone ${zone}`,
    fruits: entry.fruits,
    vegetables: entry.vegetables,
  };
}