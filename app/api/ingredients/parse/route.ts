import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { rawInput } = await req.json();

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid ingredient string" },
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

    const prompt = `
      You are an expert culinary assistant. The user has provided the following raw ingredient input: "${rawInput}".
      Your task is to parse this input and return a structured JSON array of ingredient objects.
      
      For each identified ingredient:
      1. Correct any spelling mistakes.
      2. Remove duplicates.
      3. Standardize the name (e.g., singular/plural appropriately).
      4. Categorize it into EXACTLY ONE of the following categories: "Vegetables", "Fruits", "Dairy", "Meat", "Spices", "Other".
      
      Return ONLY a JSON array of objects. Do not include any markdown formatting or extra text.
      Example format:
      [
        { "name": "Chicken Breast", "category": "Meat" },
        { "name": "Onion", "category": "Vegetables" },
        { "name": "Garlic", "category": "Spices" }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up markdown wrapper
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedIngredients = JSON.parse(jsonStr);

    return NextResponse.json({ ingredients: parsedIngredients });
  } catch (error) {
    console.error("Ingredient parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse ingredients." },
      { status: 500 }
    );
  }
}
