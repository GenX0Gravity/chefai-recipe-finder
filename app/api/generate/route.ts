import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { 
      ingredients, 
      cuisineType, 
      skillLevel, 
      dietaryRestrictions, 
      cookingTime,
      mode
    } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide a list of ingredients" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let personaPrompt = "You are an expert culinary AI.";
    if (mode === "leftover") {
      personaPrompt = "You are a master zero-waste chef. Create an inventive recipe using ONLY the exact leftovers provided. Do not suggest adding major ingredients that aren't listed.";
    } else if (mode === "festival") {
      personaPrompt = "You are a high-end caterer specializing in festive, celebratory dishes. Create a spectacular, visually impressive recipe fit for a grand festival or special occasion.";
    } else if (mode === "budget") {
      personaPrompt = "You are a frugal, budget-conscious cooking expert. Create a delicious but highly economical recipe, minimizing the use of expensive ingredients and maximizing flavor on a tight budget.";
    } else if (mode === "weight-loss") {
      personaPrompt = "You are a specialized nutritionist focused on weight loss. Create a highly satiating, low-calorie, nutrient-dense recipe designed specifically for fat loss while maintaining flavor.";
    } else if (mode === "muscle-gain") {
      personaPrompt = "You are a sports nutritionist. Create a high-protein, calorie-dense meal designed for athletes and bodybuilders to maximize muscle growth and recovery.";
    } else if (mode === "kids-friendly") {
      personaPrompt = "You are an expert in children's nutrition and picky eaters. Create a fun, visually appealing, and highly palatable recipe that hides vegetables and is guaranteed to be loved by kids.";
    } else if (mode === "senior-citizen") {
      personaPrompt = "You are a dietitian specializing in geriatric nutrition. Create a recipe that is easy to chew, highly digestible, low in sodium, and rich in essential nutrients for senior citizens.";
    } else if (mode === "regional-indian") {
      personaPrompt = "You are a master of authentic regional Indian cuisine (e.g., Chettinad, Bengali, Punjabi, Kerala). Create a highly traditional recipe with deep Indian flavors, specifying the exact region it originates from.";
    }

    const prompt = `
      ${personaPrompt} Create a highly detailed and delicious recipe using ONLY the supplied ingredients: ${ingredients.join(", ")}.
      It is perfectly acceptable to assume the user has basic kitchen staples like salt, pepper, oil, and water.

      AI must STRICTLY follow selected diet restrictions. Do not include any ingredients or methods that violate these restrictions. If the user provides an ingredient that violates the selected dietary restrictions, you must omit it or find an acceptable substitute.

      Constraints & Preferences:
      - Cuisine Type: ${cuisineType || "Any"}
      - Skill Level: ${skillLevel || "Any"}
      - Dietary Restrictions: ${dietaryRestrictions || "None"}
      - Maximum Cooking Time: ${cookingTime || "Any"}

      You must return the recipe STRICTLY in the following JSON format without any markdown wrappers, code blocks, or additional conversational text. Ensure it is valid, parseable JSON:
      {
        "title": "Recipe Title",
        "description": "A short, appetizing description of the dish",
        "prepTime": "e.g., 10 mins",
        "cookTime": "e.g., 20 mins",
        "calories": 450,
        "difficulty": "e.g., Beginner, Intermediate, Advanced",
        "ingredients": ["Ingredient 1 with quantity", "Ingredient 2 with quantity"],
        "instructions": ["Step 1 detailed", "Step 2 detailed"],
        "nutritionFacts": {
          "protein": "e.g., 20g",
          "carbs": "e.g., 50g",
          "fat": "e.g., 15g"
        },
        "chefTips": ["Pro tip 1", "Pro tip 2"],
        "dietaryBadges": ["List of dietary restrictions this recipe strictly complies with, e.g. Vegan, Keto"],
        "groceryList": [
          {
            "ingredient": "Missing ingredient name",
            "quantity": "Amount needed",
            "estimatedCost": 2.50,
            "priority": "High"
          }
        ]
      }

      Note for groceryList: Compare the provided ingredients to the recipe ingredients. Identify any missing items. For each missing item, provide the name, quantity required, estimated cost in USD as a number, and priority level (High/Medium/Low based on how essential it is). If no ingredients are missing, return an empty array [].
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown wrapper from Gemini response
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recipe = JSON.parse(jsonStr);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again later." },
      { status: 500 }
    );
  }
}
