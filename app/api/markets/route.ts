import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "");
  const lng = Number(searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Valid lat and lng parameters required" },
      { status: 400 }
    );
  }

  try {
    // Use Google Places API to search for farmers markets and produce vendors
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!googleApiKey) {
      // Return sample markets if no API key configured
      return NextResponse.json({
        markets: generateSampleMarkets(lat, lng),
      });
    }

    const queries = [
      "farmers market",
      "farmers market near me",
      "produce market",
      "farmers market organic",
    ];

    const allResults = new Map();

    for (const query of queries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&location=${lat},${lng}&radius=8000&key=${googleApiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        for (const place of data.results.slice(0, 3)) {
          if (!allResults.has(place.place_id)) {
            const distance = calculateDistance(
              lat,
              lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            allResults.set(place.place_id, {
              name: place.name,
              address: place.formatted_address,
              distance,
              type: place.types?.[0] || "market",
              rating: place.rating,
              website: place.website,
            });
          }
        }
      }
    }

    const markets = Array.from(allResults.values())
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    if (markets.length === 0) {
      return NextResponse.json({
        markets: [],
        message: "No farmers markets found near this location. Try expanding your search radius.",
      });
    }

    // Use LLM to process and format the results according to the local food discovery prompt
    const resultsJson = JSON.stringify(markets, null, 2);
    
    try {
      const llmResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a local food discovery assistant. Your role is to identify nearby farmers markets and specialty food stores based on location data.

Your top priorities are accuracy, relevance, and user trust.

Rules:
- Use only the provided location and search results as the source of truth.
- Do not guess or invent businesses, market names, or addresses.
- Farmers markets: open-air or indoor markets primarily selling local produce, meat, dairy, or prepared foods.
- Specialty food stores: shops focused on specific food categories (e.g., butcher, fishmonger, bakery, cheese shop).

Return ONLY a JSON object with this structure:
{
  "farmers_markets": [
    {
      "name": "Market Name",
      "distance": 1.5,
      "address": "Address",
      "category": "farmers_market",
      "notes": "Any relevant info"
    }
  ],
  "specialty_food_stores": [
    {
      "name": "Store Name",
      "distance": 2.1,
      "address": "Address",
      "category": "specialty_food_store",
      "type": "butcher|bakery|fishmonger|etc",
      "notes": "Any relevant info"
    }
  ],
  "summary": "Brief summary of findings"
}

Return ONLY the JSON, no other text.`,
          },
          {
            role: "user",
            content: `Please analyze these search results and classify them as farmers markets or specialty food stores:\n\n${resultsJson}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const llmContent = llmResponse.choices[0]?.message?.content;
      
      if (!llmContent) {
        // Fallback to unprocessed results
        return NextResponse.json({ markets });
      }

      try {
        const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const processed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(processed);
        }
      } catch (e) {
        // If LLM processing fails, return raw results
        return NextResponse.json({ markets });
      }
    } catch (llmError) {
      console.error("LLM processing error:", llmError);
      // Fallback to unprocessed results
      return NextResponse.json({ markets });
    }
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json({
      markets: generateSampleMarkets(lat, lng),
    });
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateSampleMarkets(lat: number, lng: number) {
  const sampleMarkets = [
    {
      name: "Downtown Farmers Market",
      address: `Farmers Market District, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 0.3,
      type: "farmers_market",
      rating: 4.6,
    },
    {
      name: "Organic Produce Market",
      address: `Community Market Square, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 0.8,
      type: "grocery",
      rating: 4.4,
    },
    {
      name: "Fresh Farm Stand",
      address: `Local Farm Area, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 1.2,
      type: "store",
      rating: 4.5,
    },
    {
      name: "Community Farmers Market",
      address: `Central Market, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 1.5,
      type: "farmers_market",
      rating: 4.7,
    },
    {
      name: "Seasonal Produce Co-op",
      address: `Agricultural District, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 2.1,
      type: "grocery",
      rating: 4.3,
    },
  ];

  return sampleMarkets;
}
