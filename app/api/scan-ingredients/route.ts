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
        text: `You are an expert kitchen assistant with extensive food knowledge. Your task is to analyze photos of kitchen items and identify EVERY food ingredient, produce item, and pantry staple visible.

IMPORTANT: Be thorough and identify as many items as possible. Look for:
- Fresh produce (vegetables, fruits, herbs)
- Proteins (meats, fish, poultry, tofu, nuts, legumes)
- Dairy (milk, cheese, eggs, yogurt, butter)
- Grains and starches (rice, pasta, bread, beans, lentils)
- Oils, condiments, and seasonings (olive oil, vinegar, soy sauce, honey)
- Canned and packaged goods
- Spices and dried herbs
- ANY recognizable food item

Return ONLY a JSON object with this exact structure:
{
  "ingredients": ["item1", "item2", "item3", ...]
}

Requirements:
- List each ingredient as a simple lowercase name
- Be SPECIFIC (e.g., "bell pepper" not just "pepper", "olive oil" not just "oil")
- Include quantity descriptors if relevant (e.g., "red bell pepper", "extra virgin olive oil")
- Identify at least 15-25+ items per image
- Remove duplicates
- Include items partially visible or in background
- Don't include packaging/containers unless they contain identifiable food

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
          .filter((ing: string) => ing.length > 1) // Allow very short items like "egg"
          .filter((ing: string) => !ing.includes('photo') && !ing.includes('image') && !ing.includes('picture')) // Filter out photo references
          .filter((ing: string, index: number, arr: string[]) => arr.indexOf(ing) === index); // Remove duplicates

        return NextResponse.json({
          ingredients: cleanedIngredients,
          imageCount: imageDataList.length,
          itemCount: cleanedIngredients.length,
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
