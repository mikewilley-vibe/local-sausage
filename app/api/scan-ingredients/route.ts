import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    
    // Get all image fields (image_0, image_1, etc.)
    const images: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        images.push(value);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Convert images to base64
    const imageDataList: string[] = [];

    for (const imageFile of images) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = imageFile.type || "image/jpeg";
      imageDataList.push(`data:${mimeType};base64,${base64}`);
    }

    if (imageDataList.length === 0) {
      return NextResponse.json(
        { error: "Could not process images" },
        { status: 400 }
      );
    }

    // Build message content with all images
    const contentArray: any[] = [
      {
        type: "text",
        text: `You are an ingredient-recognition assistant.

Your task is to identify visible food ingredients from user-uploaded photos of fridges, pantries, countertops, groceries, or freezer contents.

Your top priority is accuracy and user trust.

Rules you must follow:
- Only identify ingredients that are reasonably visible in the image.
- Do not invent, assume, or guess ingredients that are not clearly visible.
- Do not infer the contents of opaque or closed containers, bags, jars, drawers, or leftovers unless the contents are clearly visible or the label is legible.
- Do not assume common items (e.g., milk, eggs, butter, oil) unless they are visible.
- Ignore non-food objects unless they directly affect identification (e.g., glare, obstruction).
- If the image quality limits identification, state this clearly and suggest how the photo could be improved.

For this task, return ONLY a JSON object with this structure:
{
  "ingredients": ["item1", "item2", "item3", ...],
  "confidence": {
    "item1": "high",
    "item2": "medium",
    "item3": "low"
  },
  "notes": {
    "item2": "partially obscured",
    "item3": "label not fully legible"
  }
}

Only include items in "ingredients" that you can identify. Include confidence levels and notes for transparency.
Return ONLY the JSON, no other text.`,
      },
    ];

    // Add images to the content
    for (const imageData of imageDataList) {
      contentArray.push({
        type: "image_url",
        image_url: {
          url: imageData,
          detail: "auto",
        },
      });
    }

    // Call OpenAI with vision
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: contentArray as any,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
        const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

        // Filter and clean ingredients
        const cleanedIngredients = ingredients
          .map((ing: string) => ing.toLowerCase().trim())
          .filter((ing: string) => ing.length > 1)
          .filter((ing: string) => !ing.includes('photo') && !ing.includes('image') && !ing.includes('picture'))
          .filter((ing: string, index: number, arr: string[]) => arr.indexOf(ing) === index);

        return NextResponse.json({
          ingredients: cleanedIngredients,
          imageCount: imageDataList.length,
          itemCount: cleanedIngredients.length,
          confidence: parsed.confidence || {},
          notes: parsed.notes || {},
        });
      } catch (parseError) {
        // If JSON parsing fails, try to extract ingredients from the text with better logic
        const lines = content.split('\n');
        const ingredients: string[] = [];
        
        for (const line of lines) {
          // Extract quoted items or list items
          const quoted = line.match(/"([^"]+)"/g);
          if (quoted) {
            quoted.forEach(q => {
              const item = q.replace(/['"]/g, '').toLowerCase().trim();
              if (item.length > 1 && !item.includes('photo') && !item.includes('image')) {
                ingredients.push(item);
              }
            });
          }
        }

        // Remove duplicates
        const uniqueIngredients = [...new Set(ingredients)].slice(0, 50);

        return NextResponse.json({
          ingredients: uniqueIngredients,
          imageCount: imageDataList.length,
          note: "Parsed from text response",
        });
      }
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : "Failed to call OpenAI API";
      console.error("Full error details:", { apiError, errorMessage });
      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error scanning ingredients:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to scan ingredients";
    console.error("Full error details:", { error, errorMessage });
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
