import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function isObject(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function normalizeEntry(entry) {
  // Ensure arrays exist and are unique, no empty strings
  const fruits = Array.isArray(entry?.fruits) ? entry.fruits : [];
  const vegetables = Array.isArray(entry?.vegetables) ? entry.vegetables : [];
  const clean = (arr) =>
    [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))].sort();
  return { fruits: clean(fruits), vegetables: clean(vegetables) };
}

function getRegionMonth(regionMonthData, region, month) {
  const key = `${region}-${month}`;
  const entry = regionMonthData[key];
  return entry ? normalizeEntry(entry) : null;
}

function mergeEntries(base, override) {
  // Override wins if provided; otherwise base
  if (!override) return base;
  return normalizeEntry({
    fruits: override.fruits ?? base.fruits,
    vegetables: override.vegetables ?? base.vegetables
  });
}

const ROOT = process.cwd();

const stateToRegionPath =
  process.env.STATE_TO_REGION ||
  path.join(ROOT, "data/seasonality/state_to_region.json");

const regionMonthPath =
  process.env.REGION_MONTH ||
  path.join(ROOT, "data/seasonality/produce_by_region_month.json");

const overridesPath =
  process.env.OVERRIDES ||
  path.join(ROOT, "data/seasonality/produce_overrides_by_state_month.json");

const existingStateMonthPath =
  process.env.EXISTING_STATE_MONTH ||
  path.join(ROOT, "data/seasonality/produce_by_state_month.json");

const outPath =
  process.env.OUT ||
  path.join(ROOT, "data/seasonality/produce_by_state_month.json");

// Behavior flags
const preserveExisting = (process.env.PRESERVE_EXISTING ?? "1") === "1"; // don't overwrite existing keys
const months = 12;

// Load inputs
const stateToRegion = readJson(stateToRegionPath);
const regionMonthData = readJson(regionMonthPath);

const overrides = fs.existsSync(overridesPath) ? readJson(overridesPath) : {};
const existing = fs.existsSync(existingStateMonthPath)
  ? readJson(existingStateMonthPath)
  : {};

if (!isObject(stateToRegion)) throw new Error("state_to_region.json must be an object");
if (!isObject(regionMonthData)) throw new Error("produce_by_region_month.json must be an object");
if (!isObject(overrides)) throw new Error("overrides must be an object");
if (!isObject(existing)) throw new Error("existing produce_by_state_month.json must be an object");

// Build output
const out = preserveExisting ? { ...existing } : {};

const states = Object.keys(stateToRegion).sort();

for (const state of states) {
  const region = stateToRegion[state];
  for (let month = 1; month <= months; month++) {
    const stateKey = `${state}-${month}`;

    // If preserving and already exists, skip
    if (preserveExisting && out[stateKey]) continue;

    // 1) region default
    const regionEntry =
      getRegionMonth(regionMonthData, region, month) ||
      getRegionMonth(regionMonthData, "National", month) || // optional fallback
      { fruits: [], vegetables: [] };

    // 2) state-month override (wins)
    const overrideEntry = overrides[stateKey] ? normalizeEntry(overrides[stateKey]) : null;

    out[stateKey] = mergeEntries(regionEntry, overrideEntry);
  }
}

writeJson(outPath, out);

console.log(`✅ Wrote ${Object.keys(out).length} entries to: ${outPath}`);
console.log(`   preserveExisting=${preserveExisting} (set PRESERVE_EXISTING=0 to regenerate everything)`);