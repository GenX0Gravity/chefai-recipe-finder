import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { type, diet, targetCalories, allergies } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const isWeekly = type === "weekly";
    const days = isWeekly ? 7 : 1;

    const prompt = `
      You are an elite, highly precise AI Dietitian and Meal Planner. 
      The user has requested a ${isWeekly ? "7-Day Weekly" : "1-Day Daily"} meal plan.
      
      Constraints:
      - Diet Type: ${diet}
      - Target Daily Calories: ${targetCalories} kcal (try to hit within +/- 100 kcal per day)
      - Allergies/Dislikes to AVOID: ${allergies || "None"}

      You must generate exactly ${days} days of meal plans. 
      For each day, provide a Breakfast, Lunch, Dinner, and one Snack.

      Return the result STRICTLY as a JSON array where each object matches this structure EXACTLY (no markdown, no backticks, just raw JSON array):
      [
        {
          "day": "Day Name (e.g., Monday)",
          "totalCalories": 2000,
          "meals": {
            "breakfast": {
              "title": "Avocado Toast with Eggs",
              "description": "Crispy whole wheat toast topped with mashed avocado and two poached eggs.",
              "calories": 450,
              "protein": "20g",
              "carbs": "40g",
              "fat": "22g"
            },
            "lunch": { ... },
            "dinner": { ... },
            "snack": { ... }
          }
        }
      ]

      Ensure the JSON is perfectly valid. Do not wrap it in \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown wrappers
    const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const plan = JSON.parse(cleanedText);
      return NextResponse.json({ plan });
    } catch {
      console.error("Failed to parse Gemini output as JSON:", cleanedText);
      return NextResponse.json({ error: "Failed to parse meal plan from AI." }, { status: 500 });
    }

  } catch (error) {
    console.error("Meal Planner AI Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to AI engine." },
      { status: 500 }
    );
  }
}
