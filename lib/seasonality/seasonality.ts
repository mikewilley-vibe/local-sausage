import { getUsdaZoneSeasonality } from "./usdaZone";
import regionMonth from "@/data/seasonality/produce_by_region_month.json";

export type SeasonalityInput = {
  month: number;
  region?: string;
  lat?: number;
  lng?: number;
};

export type SeasonalityResult = {
  regionLabel: string;
  fruits: string[];
  vegetables: string[];
};

function getRegionMonthSeasonality(input: SeasonalityInput): SeasonalityResult {
  if (!input.region) {
    return { regionLabel: "Unknown", fruits: [], vegetables: [] };
  }

  const key = `${input.region}-${input.month}`;
  const entry = (regionMonth as any)[key];

  return {
    regionLabel: input.region,
    fruits: entry?.fruits ?? [],
    vegetables: entry?.vegetables ?? [],
  };
}

export function getSeasonality(input: SeasonalityInput): SeasonalityResult {
  // Prefer USDA zone if coordinates available
  if (input.lat !== undefined && input.lng !== undefined) {
    try {
      return getUsdaZoneSeasonality(input as any);
    } catch {
      // Fall through to region
    }
  }

  // Fall back to region-based
  if (input.region) {
    return getRegionMonthSeasonality(input);
  }

  return { regionLabel: "Unknown", fruits: [], vegetables: [] };
}