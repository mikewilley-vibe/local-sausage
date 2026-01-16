import fs from "node:fs";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function has(arr, s) {
  return Array.isArray(arr) && arr.includes(s);
}

function fail(msg) {
  console.error("❌ " + msg);
  process.exitCode = 1;
}

const stateMonth = readJson("data/seasonality/produce_by_state_month.json");
const regionMonth = readJson("data/seasonality/produce_by_region_month.json");
const zoneMonth = readJson("data/seasonality/produce_by_zone_month.json");

// 1) counts
const smKeys = Object.keys(stateMonth);
const rmKeys = Object.keys(regionMonth);
const zmKeys = Object.keys(zoneMonth);

console.log("State-month keys:", smKeys.length);
console.log("Region-month keys:", rmKeys.length);
console.log("Zone-month keys:", zmKeys.length);

// 2) spot check VA months exist
for (let m = 1; m <= 12; m++) {
  const k = `VA-${m}`;
  if (!stateMonth[k]) fail(`Missing ${k}`);
}

// 3) ensure arrays exist everywhere
for (const [k, v] of Object.entries(stateMonth)) {
  if (!v || !Array.isArray(v.fruits) || !Array.isArray(v.vegetables)) {
    fail(`Bad entry shape at ${k}`);
  }
}

// 4) warn (don’t fail) if any month is totally empty for a big state
const bigStates = ["CA", "TX", "NY", "FL", "VA"];
for (const s of bigStates) {
  for (let m = 1; m <= 12; m++) {
    const e = stateMonth[`${s}-${m}`];
    if (e && e.fruits.length === 0 && e.vegetables.length === 0) {
      console.warn("⚠️ Empty list:", `${s}-${m}`);
    }
  }
}

console.log("✅ Check complete");