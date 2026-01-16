#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sanity checker for produce data
 * Flags:
 * - Empty months/zones
 * - Duplicate items
 * - Missing states
 */

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function checkProduceData(filePath, dataType) {
  console.log(`\n📋 Checking ${dataType}...`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const issues = [];
  
  // Check for empty entries
  Object.entries(data).forEach(([key, value]) => {
    if (!value.fruits && !value.vegetables) {
      issues.push(`❌ Entry "${key}" has no fruits or vegetables`);
    }
    if (Array.isArray(value.fruits) && value.fruits.length === 0) {
      issues.push(`⚠️  Entry "${key}" has empty fruits array`);
    }
    if (Array.isArray(value.vegetables) && value.vegetables.length === 0) {
      issues.push(`⚠️  Entry "${key}" has empty vegetables array`);
    }
    
    // Check for duplicates within an entry
    if (Array.isArray(value.fruits)) {
      const fruitsSet = new Set(value.fruits);
      if (fruitsSet.size !== value.fruits.length) {
        const dupes = value.fruits.filter((item, idx) => value.fruits.indexOf(item) !== idx);
        issues.push(`⚠️  Entry "${key}" has duplicate fruits: ${dupes.join(", ")}`);
      }
    }
    
    if (Array.isArray(value.vegetables)) {
      const veggiesSet = new Set(value.vegetables);
      if (veggiesSet.size !== value.vegetables.length) {
        const dupes = value.vegetables.filter((item, idx) => value.vegetables.indexOf(item) !== idx);
        issues.push(`⚠️  Entry "${key}" has duplicate vegetables: ${dupes.join(", ")}`);
      }
    }
  });
  
  // Report issues
  if (issues.length === 0) {
    console.log(`✅ No issues found in ${dataType}`);
    console.log(`   Total entries: ${Object.keys(data).length}`);
  } else {
    console.log(`Found ${issues.length} issue(s):`);
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  return issues.length === 0;
}

function checkRegionalSpecialties(filePath) {
  console.log(`\n🗺️  Checking regional specialties...`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const issues = [];
  const coveredStates = new Set();
  
  Object.entries(data).forEach(([region, info]) => {
    if (!info.states || !Array.isArray(info.states)) {
      issues.push(`❌ Region "${region}" has no states array`);
      return;
    }
    
    // Check for invalid state codes
    info.states.forEach(state => {
      if (!US_STATES.includes(state)) {
        issues.push(`❌ Region "${region}" has invalid state code: ${state}`);
      } else {
        coveredStates.add(state);
      }
    });
    
    // Check for empty specialties
    if (!info.specialties || info.specialties.length === 0) {
      issues.push(`⚠️  Region "${region}" has no specialties`);
    }
  });
  
  // Check for missing states
  const missingStates = US_STATES.filter(state => !coveredStates.has(state));
  if (missingStates.length > 0) {
    issues.push(`⚠️  Missing states not covered by any region: ${missingStates.join(", ")}`);
  }
  
  // Report issues
  if (issues.length === 0) {
    console.log(`✅ No issues found`);
    console.log(`   Regions: ${Object.keys(data).length}`);
    console.log(`   States covered: ${coveredStates.size}/${US_STATES.length}`);
  } else {
    console.log(`Found ${issues.length} issue(s):`);
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  return issues.length === 0;
}

function main() {
  console.log("🔍 Data Sanity Checker\n");
  console.log("=".repeat(50));
  
  const dataDir = path.join(__dirname, "../data/seasonality");
  const regionFile = path.join(dataDir, "produce_by_region_month.json");
  const zoneFile = path.join(__dirname, "../seasonal-sous-chef/data/seasonality/produce_by_zone_month.json");
  const specialtiesFile = path.join(__dirname, "../seasonal-sous-chef/data/regional_specialties.json");
  
  let allGood = true;
  
  allGood = checkProduceData(regionFile, "produce_by_region_month") && allGood;
  allGood = checkProduceData(zoneFile, "produce_by_zone_month") && allGood;
  allGood = checkRegionalSpecialties(specialtiesFile) && allGood;
  
  console.log("\n" + "=".repeat(50));
  if (allGood) {
    console.log("✅ All checks passed!");
  } else {
    console.log("⚠️  Some issues found. Review above.");
  }
}

main();
