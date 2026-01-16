#!/usr/bin/env node

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.OPENAI_API_KEY) {
  console.error(
    "Error: OPENAI_API_KEY environment variable is not set"
  );
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify client is initialized
if (!openai.messages) {
  console.error("Error: OpenAI client failed to initialize");
  process.exit(1);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const USDA_ZONES = [
  "3a",
  "3b",
  "4a",
  "4b",
  "5a",
  "5b",
  "6a",
  "6b",
  "7a",
  "7b",
  "8a",
  "8b",
];

async function generateProduceForZoneMonth(zone, month) {
  const prompt = `List the seasonal produce (fruits and vegetables) that are typically in season during ${month} in USDA Hardiness Zone ${zone}. 

Return a JSON object with this structure:
{
  "fruits": ["fruit1", "fruit2", ...],
  "vegetables": ["vegetable1", "vegetable2", ...]
}

Only include produce that is actually harvested/available fresh during this month in this zone. Be realistic about what's in season.`;

  try {
    const message = await openai.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error generating produce for ${zone} ${month}:`, error.message);
    return { fruits: [], vegetables: [] };
  }
}

async function main() {
  console.log("Generating seasonal produce data...");

  const produceByZoneMonth = {};

  for (const zone of USDA_ZONES) {
    for (let monthIndex = 0; monthIndex < MONTHS.length; monthIndex++) {
      const month = MONTHS[monthIndex];
      const key = `${zone}-${monthIndex + 1}`;

      console.log(`Generating: ${key} (${zone} in ${month})`);

      const produce = await generateProduceForZoneMonth(zone, month);
      produceByZoneMonth[key] = produce;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Write the output
  const outputPath = path.join(
    __dirname,
    "../seasonal-sous-chef/data/seasonality/produce_by_zone_month.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(produceByZoneMonth, null, 2),
    "utf-8"
  );

  console.log(`✓ Generated produce data written to ${outputPath}`);
}

main().catch(console.error);
