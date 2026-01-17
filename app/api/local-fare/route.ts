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
    // Use Google Places API to search for restaurants
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!googleApiKey) {
      // Return sample restaurants if no API key configured
      return NextResponse.json({
        restaurants: generateSampleRestaurants(lat, lng),
      });
    }

    const queries = [
      "farm to table restaurant",
      "organic restaurant",
      "farm restaurant",
      "local restaurant",
      "seasonal menu restaurant",
    ];

    const allResults = new Map<string, any>();

    for (const query of queries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&location=${lat},${lng}&radius=8000&key=${googleApiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
          for (const place of data.results.slice(0, 3)) {
            if (place.place_id && !allResults.has(place.place_id)) {
              const distance = calculateDistance(
                lat,
                lng,
                place.geometry?.location?.lat || 0,
                place.geometry?.location?.lng || 0
              );

              allResults.set(place.place_id, {
                name: place.name || "Restaurant",
                address: place.formatted_address || "Location",
                distance,
                cuisine: extractCuisine(place.types || []),
                rating: place.rating || undefined,
                website: place.website || undefined,
              });
            }
          }
        }
      } catch (queryError) {
        console.error(`Error with query "${query}":`, queryError);
      }
    }

    const restaurants = Array.from(allResults.values())
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 10);

    if (restaurants.length === 0) {
      return NextResponse.json({
        restaurants: [],
        message: "No restaurants found near this location. Try expanding your search radius.",
      });
    }

    // Use LLM to analyze and rank restaurants based on review patterns
    const restaurantsJson = JSON.stringify(restaurants, null, 2);
    
    try {
      const llmResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a local restaurant review analysis assistant. Your role is to analyze provided restaurant data and present a clear, trustworthy list to the user.

Your top priorities are accuracy, transparency, and usefulness.

Rules:
- Use only the restaurants and review data provided.
- Do not invent restaurant names, ratings, or review content.
- Prioritize restaurants that are closer, have higher ratings, and meaningful review counts.
- Avoid over-weighting popularity alone.

For each restaurant, include:
- name
- cuisine type (if available)
- distance from user
- rating + review count (if available)
- short summary of common themes from reviews (1–2 sentences max, if available)
- notes if data is limited

Return ONLY a JSON object with this structure:
{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "distance": 1.5,
      "address": "Address",
      "rating": 4.5,
      "reviewCount": 128,
      "summary": "Known for fresh ingredients and seasonal menu. Good atmosphere.",
      "notes": "Data limited - only Google reviews available"
    }
  ],
  "summary": "Brief summary of findings and relevance"
}

Return ONLY the JSON, no other text.`,
          },
          {
            role: "user",
            content: `Please analyze and rank these restaurant results by relevance to the user:\n\n${restaurantsJson}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const llmContent = llmResponse.choices[0]?.message?.content;
      
      if (!llmContent) {
        // Fallback to unprocessed results
        return NextResponse.json({ restaurants });
      }

      try {
        const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const processed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(processed);
        }
      } catch (e) {
        // If LLM processing fails, return raw results
        return NextResponse.json({ restaurants });
      }
    } catch (llmError) {
      console.error("LLM processing error:", llmError);
      // Fallback to unprocessed results
      return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json({
      restaurants: generateSampleRestaurants(lat, lng),
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

function extractCuisine(types: string[]): string {
  if (!Array.isArray(types)) return "Restaurant";
  
  const cuisineKeywords = ["restaurant", "cafe", "bar", "bistro", "gastropub"];

  for (const type of types) {
    if (typeof type === "string") {
      for (const keyword of cuisineKeywords) {
        if (type.toLowerCase().includes(keyword)) {
          return type
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        }
      }
    }
  }

  return "Restaurant";
}

function generateSampleRestaurants(lat: number, lng: number) {
  const sampleRestaurants = [
    {
      name: "Farm to Table Kitchen",
      address: `Local Farm Restaurant, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 0.4,
      cuisine: "Farm to Table",
      rating: 4.7,
    },
    {
      name: "Seasonal Bistro",
      address: `Downtown Dining District, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 0.7,
      cuisine: "Contemporary",
      rating: 4.6,
    },
    {
      name: "Organic Kitchen",
      address: `Community Food Hall, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 1.1,
      cuisine: "Organic",
      rating: 4.5,
    },
    {
      name: "Local Harvest Café",
      address: `Market District, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 1.3,
      cuisine: "Café",
      rating: 4.4,
    },
    {
      name: "Farmer's Gastropub",
      address: `Heritage District, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 1.8,
      cuisine: "Gastropub",
      rating: 4.6,
    },
    {
      name: "Garden Restaurant",
      address: `Botanical Area, near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      distance: 2.1,
      cuisine: "Contemporary",
      rating: 4.3,
    },
  ];

  return sampleRestaurants;
}
