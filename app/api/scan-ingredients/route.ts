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
        text: `You are a helpful kitchen assistant. Please analyze these photos of kitchen items/ingredients and identify all the food ingredients, produce, and pantry items you can see.

Return ONLY a JSON object with this structure:
{
  "ingredients": ["item1", "item2", "item3", ...]
}

List each ingredient as a simple lowercase name. Be specific but concise. Include vegetables, fruits, meats, dairy, pantry staples, herbs, spices, etc. that you can clearly identify.`,
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
        temperature: 0.7,
        max_tokens: 500,
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
          .filter((ing: string) => ing.length > 0)
          .filter((ing: string, index: number, arr: string[]) => arr.indexOf(ing) === index); // Remove duplicates

        return NextResponse.json({
          ingredients: cleanedIngredients,
          imageCount: imageDataList.length,
        });
      } catch (parseError) {
        // If JSON parsing fails, try to extract ingredients from the text
        const ingredientMatches = content.match(/[\w\s]+/g) || [];
        const ingredients = ingredientMatches
          .filter((word: string) => word.length > 2)
          .slice(0, 20);

        return NextResponse.json({
          ingredients,
          imageCount: imageDataList.length,
          note: "Parsed from text response",
        });
      }
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      return NextResponse.json(
        {
          error: apiError instanceof Error ? apiError.message : "Failed to call OpenAI API",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error scanning ingredients:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to scan ingredients",
      },
      { status: 500 }
    );
  }
}
