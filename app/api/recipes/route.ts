import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ? "1" : "1"; // Fallback for demo

    const body = await req.json();
    const { 
      title, 
      description,
      prepTime,
      cookTime,
      calories,
      difficulty,
      ingredients, 
      instructions, 
      nutritionFacts,
      chefTips,
      dietaryBadges,
      imageUrl,
      notes,
      isHistory,
      collectionId,
      groceryList
    } = body;

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        prepTime,
        cookTime,
        calories,
        difficulty,
        ingredients,
        instructions,
        nutritionFacts: nutritionFacts ? nutritionFacts : undefined,
        chefTips: chefTips || [],
        dietaryBadges: dietaryBadges || [],
        imageUrl,
        notes,
        groceryList: groceryList ? groceryList : undefined,
        isHistory: isHistory ?? false,
        collectionId,
        userId,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error saving recipe:", error);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ? "1" : "1";

    const recipes = await prisma.recipe.findMany({
      where: { userId },
      include: { favorites: true, collection: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
