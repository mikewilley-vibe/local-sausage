// app/api/seasonal/route.ts
import { NextResponse } from "next/server";
import regionMonth from "../../../data/seasonality/produce_by_region_month.json";
import zoneMonth from "../../../data/seasonality/produce_by_zone_month.json";
import grid from "../../../data/usda/zones_by_lat_lng.json";
import { getUsdaZoneSeasonality } from "../../../lib/seasonality/usdaZone";

function getByRegion(region: string, month: number) {
  return (regionMonth as any)[`${region}-${month}`] ?? { fruits: [], vegetables: [] };
}

function getByZone(zone: string, month: number) {
  return (zoneMonth as any)[`${zone}-${month}`] ?? { fruits: [], vegetables: [] };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "";
  const month = Number(searchParams.get("month") ?? "");
  const lat = Number(searchParams.get("lat") ?? "");
  const lng = Number(searchParams.get("lng") ?? "");

  if (!month || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid month (1-12)" }, { status: 400 });
  }

  try {
    // Try USDA zone first if lat/lng provided
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const result = getUsdaZoneSeasonality({ lat, lng, month });
      return NextResponse.json({ source: "usda-zone", ...result });
    }

    // Fall back to region
    if (region) {
      const produce = getByRegion(region, month);
      return NextResponse.json({
        source: "region",
        region,
        month,
        regionLabel: region,
        ...produce
      });
    }

    return NextResponse.json(
      { error: "Either (lat, lng) or region parameter required" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}