import fs from "node:fs";
import path from "node:path";

const OUT = "data/seasonality/produce_by_region_month.json";

const REGIONS = [
  "Northeast",
  "MidAtlantic",
  "Southeast",
  "Midwest",
  "Plains",
  "Mountain",
  "Southwest",
  "West",
  "South",
  "Alaska",
  "Hawaii",
  "National"
];

// Conservative baseline by “climate family” with small lists.
// You can tune anytime; this is meant to be safe and not overclaim.
const climateFamily = {
  Cool: {
    1: { f:["apples"], v:["potatoes","carrots","cabbage","kale","winter squash"] },
    2: { f:["apples"], v:["potatoes","carrots","cabbage","kale"] },
    3: { f:["apples"], v:["spinach","lettuce","radishes"] },
    4: { f:["strawberries"], v:["asparagus","spinach","lettuce","radishes"] },
    5: { f:["strawberries","cherries"], v:["lettuce","peas","broccoli"] },
    6: { f:["strawberries","blueberries"], v:["green beans","cucumbers","zucchini"] },
    7: { f:["blueberries"], v:["tomatoes","corn","zucchini","green beans"] },
    8: { f:["peaches","grapes"], v:["tomatoes","corn","peppers"] },
    9: { f:["apples"], v:["winter squash","pumpkins","sweet potatoes"] },
    10:{ f:["apples","pears"], v:["broccoli","cauliflower","cabbage"] },
    11:{ f:["apples"], v:["kale","carrots","cabbage"] },
    12:{ f:["apples"], v:["potatoes","carrots","cabbage","kale"] }
  },
  Temperate: {
    1: { f:["apples"], v:["kale","collards","sweet potatoes","winter squash","carrots","cabbage"] },
    2: { f:["apples"], v:["kale","collards","sweet potatoes","winter squash","carrots","cabbage"] },
    3: { f:["apples"], v:["asparagus","spinach","lettuce","radishes"] },
    4: { f:["strawberries"], v:["asparagus","lettuce","spinach","radishes","peas"] },
    5: { f:["strawberries","cherries"], v:["lettuce","peas","broccoli","beets"] },
    6: { f:["strawberries","blueberries"], v:["green beans","cucumbers","zucchini","tomatoes"] },
    7: { f:["peaches","blueberries","blackberries"], v:["tomatoes","corn","zucchini","green beans","peppers"] },
    8: { f:["peaches","watermelon","grapes"], v:["tomatoes","corn","peppers","eggplant"] },
    9: { f:["apples","grapes"], v:["sweet potatoes","winter squash","pumpkins","peppers"] },
    10:{ f:["apples","pears"], v:["broccoli","cauliflower","cabbage","pumpkins","kale"] },
    11:{ f:["apples"], v:["kale","collards","cabbage","turnips","carrots"] },
    12:{ f:["apples"], v:["kale","collards","cabbage","sweet potatoes","winter squash","carrots"] }
  },
  Warm: {
    1: { f:["citrus","strawberries"], v:["lettuce","cabbage","carrots","sweet potatoes"] },
    2: { f:["citrus","strawberries"], v:["lettuce","spinach","cabbage","carrots"] },
    3: { f:["strawberries"], v:["asparagus","lettuce","spinach"] },
    4: { f:["strawberries"], v:["tomatoes","lettuce","cucumbers"] },
    5: { f:["blueberries"], v:["tomatoes","green beans","cucumbers","zucchini"] },
    6: { f:["peaches","watermelon"], v:["tomatoes","corn","peppers","okra"] },
    7: { f:["watermelon","stone fruit"], v:["tomatoes","corn","peppers","okra","eggplant"] },
    8: { f:["grapes","figs"], v:["tomatoes","peppers","eggplant"] },
    9: { f:["apples"], v:["sweet potatoes","winter squash","pumpkins"] },
    10:{ f:["apples","pears"], v:["greens","broccoli","cabbage"] },
    11:{ f:["citrus"], v:["greens","cabbage","carrots"] },
    12:{ f:["citrus"], v:["greens","sweet potatoes","cabbage"] }
  },
  Tropical: {
    1: { f:["citrus","pineapple"], v:["sweet potatoes","greens"] },
    2: { f:["citrus","pineapple"], v:["greens","sweet potatoes"] },
    3: { f:["pineapple","mangoes"], v:["tomatoes","cucumbers"] },
    4: { f:["mangoes","pineapple"], v:["tomatoes","cucumbers"] },
    5: { f:["mangoes"], v:["tomatoes","peppers"] },
    6: { f:["mangoes"], v:["tomatoes","peppers"] },
    7: { f:["mangoes","papaya"], v:["sweet potatoes","greens"] },
    8: { f:["papaya"], v:["sweet potatoes","greens"] },
    9: { f:["pineapple"], v:["greens"] },
    10:{ f:["citrus"], v:["greens"] },
    11:{ f:["citrus"], v:["greens"] },
    12:{ f:["citrus"], v:["greens"] }
  },
  Arctic: {
    // Very conservative; most fresh produce is limited/short season
    1: { f:[], v:["potatoes","carrots","cabbage"] },
    2: { f:[], v:["potatoes","carrots","cabbage"] },
    3: { f:[], v:["greens"] },
    4: { f:[], v:["greens"] },
    5: { f:[], v:["greens"] },
    6: { f:["berries"], v:["greens"] },
    7: { f:["berries"], v:["greens"] },
    8: { f:["berries"], v:["greens"] },
    9: { f:[], v:["potatoes","carrots"] },
    10:{ f:[], v:["potatoes","carrots","cabbage"] },
    11:{ f:[], v:["potatoes","carrots","cabbage"] },
    12:{ f:[], v:["potatoes","carrots","cabbage"] }
  }
};

// Map region → climate family baseline
const regionFamily = {
  Northeast: "Cool",
  Midwest: "Cool",
  Plains: "Cool",
  Mountain: "Cool",
  MidAtlantic: "Temperate",
  West: "Temperate",
  South: "Warm",
  Southeast: "Warm",
  Southwest: "Warm",
  Hawaii: "Tropical",
  Alaska: "Arctic",
  National: "Temperate"
};

function clean(arr) {
  return [...new Set(arr.map(String).map(s => s.trim()).filter(Boolean))].sort();
}

const out = {};
for (const region of REGIONS) {
  const fam = regionFamily[region] ?? "Temperate";
  const byMonth = climateFamily[fam];

  for (let month = 1; month <= 12; month++) {
    const entry = byMonth[month] ?? { f: [], v: [] };
    out[`${region}-${month}`] = {
      fruits: clean(entry.f),
      vegetables: clean(entry.v)
    };
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`✅ Wrote ${Object.keys(out).length} entries to ${OUT}`);