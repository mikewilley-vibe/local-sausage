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

  const input = `
You are a practical home cook.
Location: ${locationLabel}
In-season items: ${inSeason.join(", ")}
Staples available: ${staples.join(", ")}
Dietary constraints: ${dietary.join(", ")}
Max time: ${maxTimeMinutes} minutes
Skill: ${skill}

Return 3 recipe cards as JSON with:
- title
- timeMinutes
- ingredients (array of strings)
- steps (array of strings)
- usesInSeason (array)
- substitutions (array)
- optionalShoppingAddOns (array)
`;

  const resp = await openai.responses.create({
    model: "gpt-5.2",
    input,
  });

  // output_text is shown in OpenAI quickstart examples
  // You can also parse structured JSON if you enforce it (next step)
  return NextResponse.json({ text: resp.output_text });
}