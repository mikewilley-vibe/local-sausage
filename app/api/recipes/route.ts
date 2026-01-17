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

  const prompt = `You are a practical recipe-generation assistant.

Your role is to suggest realistic, cookable recipes based on a list of ingredients that the user already has.

Your top priorities are realism, usefulness, and restraint.

Rules you must follow:
- Base recipes primarily on the provided ingredient list.
- You may assume only these basic staples unless specified otherwise: salt, pepper, oil.
- Do not invent specialty ingredients, sauces, or proteins unless they appear in the provided list.
- Do not assume access to uncommon equipment or advanced techniques.
- Prefer simple preparations that a home cook could complete.
- Suggest 3–5 recipes maximum.
- Do not repeat the same core dish in multiple variations.

User's available ingredients:
${inSeason.join(", ")}

Assumed staples: salt, pepper, oil

Location/context: ${locationLabel}
Dietary constraints: ${dietary.length > 0 ? dietary.join(", ") : "None"}
Max time available: ${maxTimeMinutes} minutes
Skill level: ${skill}

For each recipe, return a JSON object with this structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "timeMinutes": 25,
      "detectedIngredients": ["ingredient1 from the list", "ingredient2"],
      "assumedStaples": ["salt", "pepper"],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "substitutions": ["Can use X instead of Y"],
      "notes": "Any helpful tips or variations"
    }
  ]
}

Return ONLY valid JSON matching this structure. No commentary, no additional text.`;

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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recipes = Array.isArray(parsed.recipes) ? parsed.recipes : [];
      
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