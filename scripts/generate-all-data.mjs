#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Master data generator that writes all three outputs in one command:
 * 1. produce_by_region_month.json
 * 2. produce_by_zone_month.json
 * 3. regional_specialties.json
 */

async function generateAllData() {
  console.log("🚀 Starting master data generation...\n");

  // Generate region-month data
  console.log("📍 Generating region-month produce data...");
  await import("./generate-produce-by-region-month.mjs");
  
  // Generate zone-month data (mock for now, can be replaced with Claude API calls)
  console.log("\n🌡️  Generating zone-month produce data...");
  generateZoneMonthData();
  
  // Generate regional specialties
  console.log("\n🌾 Generating regional specialties...");
  generateRegionalSpecialties();
  
  console.log("\n✅ All data generation complete!");
}

function generateZoneMonthData() {
  const zones = ["3a", "3b", "4a", "4b", "5a", "5b", "6a", "6b", "7a", "7b", "8a", "8b"];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const zoneData = {};
  
  for (const zone of zones) {
    for (const month of months) {
      const key = `${zone}-${month}`;
      // Generate realistic data based on zone and month
      zoneData[key] = generateProduceForZoneMonth(zone, month);
    }
  }
  
  const outputPath = path.join(
    __dirname,
    "../data/seasonality/produce_by_zone_month.json"
  );
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(zoneData, null, 2),
    "utf-8"
  );
  
  console.log(`✓ Wrote zone-month data to produce_by_zone_month.json`);
}

function generateProduceForZoneMonth(zone, month) {
  // Simplified logic: earlier zones have shorter seasons
  const zoneNumber = parseInt(zone);
  const seasonStart = 4 + (zoneNumber - 3); // Later zones start later
  const seasonEnd = 10 - (zoneNumber - 3);  // Earlier zones end earlier
  
  const inSeason = month >= seasonStart && month <= seasonEnd;
  
  if (!inSeason && month < 4 || month > 10) {
    return {
      fruits: ["stored apples", "dried berries"],
      vegetables: ["root vegetables", "squash", "kale"]
    };
  }
  
  if (month >= 4 && month <= 5) {
    return {
      fruits: ["strawberries"],
      vegetables: ["asparagus", "peas", "lettuce", "spinach"]
    };
  }
  
  if (month >= 6 && month <= 7) {
    return {
      fruits: ["raspberries", "blueberries", "cherries"],
      vegetables: ["beans", "corn", "zucchini", "tomatoes"]
    };
  }
  
  if (month >= 8 && month <= 9) {
    return {
      fruits: ["apples", "peaches", "grapes"],
      vegetables: ["tomatoes", "peppers", "eggplant", "squash"]
    };
  }
  
  return {
    fruits: ["apples"],
    vegetables: ["squash", "pumpkins", "carrots"]
  };
}

function generateRegionalSpecialties() {
  const specialties = {
    "Northeast": {
      region: "Northeast",
      states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
      specialties: ["apples", "cranberries", "blueberries", "potatoes", "lobster"],
      season: "Fall"
    },
    "Mid-Atlantic": {
      region: "Mid-Atlantic",
      states: ["DE", "MD", "VA", "WV", "DC"],
      specialties: ["tomatoes", "corn", "peaches", "crab", "oysters"],
      season: "Summer"
    },
    "Southeast": {
      region: "Southeast",
      states: ["NC", "SC", "GA", "FL", "AL", "MS", "LA", "AR", "TN", "KY"],
      specialties: ["citrus", "peaches", "strawberries", "greens", "peanuts"],
      season: "Winter/Spring"
    },
    "Midwest": {
      region: "Midwest",
      states: ["OH", "IN", "IL", "MI", "WI", "MN", "IA", "MO"],
      specialties: ["corn", "soybeans", "apples", "cheese", "beef"],
      season: "Summer/Fall"
    },
    "Great Plains": {
      region: "Great Plains",
      states: ["ND", "SD", "NE", "KS", "OK", "TX"],
      specialties: ["wheat", "cattle", "pork", "pecans", "cotton"],
      season: "Year-round"
    },
    "Southwest": {
      region: "Southwest",
      states: ["NM", "AZ", "UT", "NV"],
      specialties: ["chiles", "pecans", "citrus", "pumpkins", "beef"],
      season: "Fall/Winter"
    },
    "West": {
      region: "West",
      states: ["CA", "OR", "WA", "ID", "MT", "WY", "CO"],
      specialties: ["lettuce", "almonds", "wine grapes", "apples", "salmon"],
      season: "Year-round"
    }
  };
  
  const outputPath = path.join(
    __dirname,
    "../data/regional_specialties.json"
  );
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(specialties, null, 2),
    "utf-8"
  );
  
  console.log(`✓ Wrote regional specialties to regional_specialties.json`);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllData().catch(console.error);
}

export { generateAllData };
