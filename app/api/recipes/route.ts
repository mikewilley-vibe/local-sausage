import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    locationLabel,
    inSeason,
    staples = [],
    dietary = [],
    maxTimeMinutes = 30,
    skill = "beginner",
  } = body;

  const prompt = `You are a practical home cook assistant.
Location: ${locationLabel}
In-season items: ${inSeason.join(", ")}
Staples available: ${staples.join(", ")}
Dietary constraints: ${dietary.length > 0 ? dietary.join(", ") : "None"}
Max time: ${maxTimeMinutes} minutes
Skill level: ${skill}

Return ONLY a valid JSON array with 3 recipe cards. Each recipe should have:
- title (string)
- timeMinutes (number)
- ingredients (array of strings)
- steps (array of strings)
- usesInSeason (array of ingredient names)
- substitutions (array of strings)
- optionalShoppingAddOns (array of strings)

Return ONLY the JSON array, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const recipes = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ recipes });
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      return NextResponse.json(
        { error: "Failed to parse recipe JSON. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate recipes" },
      { status: 500 }
    );
  }
}