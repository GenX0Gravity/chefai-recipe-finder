"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X, ChefHat, Save, CheckCircle2, Clock, Flame, Info, Utensils, Loader2, Download, Share2, RefreshCw, Headphones } from "lucide-react";
import VoiceCookingAssistant from "@/components/VoiceCookingAssistant";
import GroceryPlanner, { GroceryItem } from "@/components/GroceryPlanner";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

type ParsedIngredient = {
  name: string;
  category: "Vegetables" | "Fruits" | "Dairy" | "Meat" | "Spices" | "Other";
};

type Recipe = {
  id?: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  calories: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  nutritionFacts?: {
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  chefTips?: string[];
  dietaryBadges?: string[];
  imageUrl?: string;
  notes?: string;
  isHistory?: boolean;
  collectionId?: string;
  groceryList?: GroceryItem[];
};

const SUPPORTED_DIETS = [
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "High Protein",
  "Low Carb"
];

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Vegetables": return { bg: "bg-green-100 text-green-800 border-green-200", icon: "🥕" };
    case "Fruits": return { bg: "bg-pink-100 text-pink-800 border-pink-200", icon: "🍎" };
    case "Dairy": return { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🧀" };
    case "Meat": return { bg: "bg-rose-100 text-rose-800 border-rose-200", icon: "🥩" };
    case "Spices": return { bg: "bg-orange-100 text-orange-800 border-orange-200", icon: "🌶️" };
    default: return { bg: "bg-gray-100 text-gray-800 border-gray-200", icon: "🥫" };
  }
};

export default function GeneratePage({ mode }: { mode?: string }) {
  const { data: session } = useSession();
  
  // Inputs
  const [ingredients, setIngredients] = useState<ParsedIngredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState("");

  const getModeTitle = (m: string) => {
    switch (m) {
      case "leftover": return "Leftover Recipe Generator";
      case "festival": return "Festival Recipe Generator";
      case "budget": return "Budget Meal Generator";
      case "weight-loss": return "Weight Loss Meal Generator";
      case "muscle-gain": return "Muscle Gain Meal Generator";
      case "kids-friendly": return "Kids-Friendly Recipes";
      case "senior-citizen": return "Senior Citizen Recipes";
      case "regional-indian": return "Regional Indian Recipes";
      default: return "The AI Recipe Generator";
    }
  };

  const toggleDietaryRestriction = (diet: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  // States
  const [parsingIngredients, setParsingIngredients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = currentIngredient.trim();
    if (!raw) return;

    setCurrentIngredient("");
    setParsingIngredients(true);
    
    try {
      const res = await fetch("/api/ingredients/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: raw }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse ingredient");
      
      const newIngredients: ParsedIngredient[] = data.ingredients;
      
      setIngredients(prev => {
        const merged = [...prev];
        newIngredients.forEach(newIng => {
          if (!merged.find(existing => existing.name.toLowerCase() === newIng.name.toLowerCase())) {
            merged.push(newIng);
          }
        });
        return merged;
      });
    } catch (err: any) {
      // Fallback if parsing fails - just add as "Other"
      setIngredients(prev => {
        if (!prev.find(existing => existing.name.toLowerCase() === raw.toLowerCase())) {
          return [...prev, { name: raw, category: "Other" }];
        }
        return prev;
      });
    } finally {
      setParsingIngredients(false);
    }
  };

  const removeIngredient = (ingName: string) => {
    setIngredients(ingredients.filter((i) => i.name !== ingName));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      toast.error("Please add some ingredients first!");
      return;
    }
    setLoading(true);
    setRecipe(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients: ingredients.map(i => i.name),
          cuisineType,
          skillLevel,
          dietaryRestrictions: dietaryRestrictions.join(", "),
          cookingTime,
          mode
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate recipe");
      
      const generatedRecipe = data.recipe;
      const prompt = `A realistic, HD food photography style image of ${generatedRecipe.title}, presented in a high-end restaurant setting. Professional food styling, beautiful lighting, mouth-watering.`;
      const seed = Math.floor(Math.random() * 1000000);
      generatedRecipe.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${seed}`;
      
      // Auto-save as history if session exists
      if (session) {
        try {
          const saveRes = await fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...generatedRecipe, isHistory: true })
          });
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            generatedRecipe.id = savedData.id;
            generatedRecipe.isHistory = true;
          }
        } catch (e) {
          console.error("Failed to auto-save history", e);
        }
      }

      setRecipe({ ...generatedRecipe, isHistory: true });
      toast.success("Recipe generated successfully!");

    } catch (err: any) {
      toast.error(err.message || "Something went wrong generating your recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImage = () => {
    if (!recipe) return;
    const prompt = `A realistic, HD food photography style image of ${recipe.title}, presented in a high-end restaurant setting. Professional food styling, beautiful lighting, mouth-watering.`;
    const seed = Math.floor(Math.random() * 1000000);
    setRecipe({
      ...recipe,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${seed}`
    });
  };

  const handleDownloadImage = async () => {
    if (!recipe?.imageUrl) return;
    try {
      const response = await fetch(recipe.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recipe.title.replace(/\s+/g, '-').toLowerCase()}-image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  const handleShareImage = async () => {
    if (!recipe?.imageUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.title,
          text: `Check out this delicious ${recipe.title}!`,
          url: recipe.imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(recipe.imageUrl);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share image");
    }
  };

  const handleSave = async () => {
    if (!recipe || !session) return;
    setSaving(true);
    try {
      if (recipe.id) {
        const res = await fetch(`/api/recipes/${recipe.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHistory: false }), 
        });
        if (res.ok) {
          setRecipe({ ...recipe, isHistory: false });
          setSaved(true);
          toast.success("Recipe saved to your cookbook!");
        }
      } else {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...recipe, isHistory: false }), 
        });
        if (res.ok) {
          const savedData = await res.json();
          setRecipe({ ...recipe, id: savedData.id, isHistory: false });
          setSaved(true);
          toast.success("Recipe saved to your cookbook!");
        } else {
          toast.error("Failed to save recipe");
        }
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-12 w-full min-h-screen">
      {/* Decorative Blur */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          {mode ? getModeTitle(mode) : "The AI Recipe Generator"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          {mode ? `Premium Mode: Specialized recipe generation tailored for your specific goals.` : `Add your available ingredients and set your preferences. Our AI culinary engine will craft the perfect dish tailored just for you.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xl border-white/20 glass-card bg-white/60 dark:bg-black/40">
            <CardHeader className="border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                Ingredients & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Ingredients */}
              <div>
                <Label htmlFor="ingredients" className="text-sm font-semibold mb-2 block text-gray-700">
                  Available Ingredients <span className="text-red-500">*</span>
                </Label>
                <form onSubmit={addIngredient} className="flex gap-2 mb-3 relative">
                  <Input
                    id="ingredients"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="e.g. Chicken breast, Garlic..."
                    className="flex-1 pr-10"
                    disabled={parsingIngredients}
                  />
                  <Button type="submit" variant="secondary" className="bg-orange-100 hover:bg-orange-200 text-orange-800" disabled={parsingIngredients || !currentIngredient.trim()}>
                    {parsingIngredients ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </form>
                {parsingIngredients && (
                  <p className="text-xs text-orange-500 italic mb-2">Analyzing ingredients...</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {ingredients.map((ing) => {
                      const style = getCategoryStyle(ing.category);
                      return (
                        <motion.span
                          key={ing.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${style.bg}`}
                        >
                          <span className="mr-1.5">{style.icon}</span>
                          {ing.name}
                          <button
                            onClick={(e) => { e.preventDefault(); removeIngredient(ing.name); }}
                            className="ml-2 hover:opacity-70 transition-opacity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                  {ingredients.length === 0 && !parsingIngredients && (
                    <p className="text-xs text-gray-400 italic">No ingredients added yet. Try pasting a comma-separated list!</p>
                  )}
                </div>
              </div>

              {/* Optional Preferences */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <Label htmlFor="cuisine" className="text-xs font-semibold text-gray-600 mb-1 block">Cuisine Type</Label>
                  <Input 
                    id="cuisine" 
                    value={cuisineType} 
                    onChange={e => setCuisineType(e.target.value)} 
                    placeholder="e.g. Italian, Mexican, Asian" 
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="skill" className="text-xs font-semibold text-gray-600 mb-1 block">Skill Level</Label>
                  <select 
                    id="skill"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={skillLevel}
                    onChange={e => setSkillLevel(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-2 block">Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_DIETS.map(diet => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDietaryRestriction(diet)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          dietaryRestrictions.includes(diet)
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="time" className="text-xs font-semibold text-gray-600 mb-1 block">Max Cooking Time</Label>
                  <Input 
                    id="time" 
                    value={cookingTime} 
                    onChange={e => setCookingTime(e.target.value)} 
                    placeholder="e.g. 30 minutes, 1 hour" 
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={handleGenerate}
                  disabled={ingredients.length === 0 || loading || parsingIngredients}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <ChefHat className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <ChefHat className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Crafting Recipe..." : "Generate Recipe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center glass-panel rounded-3xl p-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 animate-spin text-orange-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cooking up something amazing...</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">Our AI is analyzing your ingredients and preferences to craft the perfect recipe.</p>
              
              {/* Skeleton Loaders */}
              <div className="w-full max-w-2xl mt-8 space-y-4">
                <Skeleton className="h-10 w-3/4 mx-auto rounded-xl bg-slate-200/50 dark:bg-slate-700/50" />
                <Skeleton className="h-6 w-1/2 mx-auto rounded-lg bg-slate-200/50 dark:bg-slate-700/50" />
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Skeleton className="h-24 w-full rounded-2xl bg-slate-200/50 dark:bg-slate-700/50" />
                  <Skeleton className="h-24 w-full rounded-2xl bg-slate-200/50 dark:bg-slate-700/50" />
                  <Skeleton className="h-24 w-full rounded-2xl bg-slate-200/50 dark:bg-slate-700/50" />
                </div>
              </div>
            </div>
          ) : !recipe ? (
            <div className="h-full">
              <EmptyState 
                icon={<ChefHat className="w-12 h-12 text-orange-500" />}
                title="Awaiting Your Ingredients"
                description="Add what you have in your kitchen on the left, and watch the magic happen."
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl glass-card">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-8 text-white relative">
                  {session && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                      onClick={handleSave}
                      disabled={saving || saved}
                    >
                      {saved ? (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Recipe"}</>
                      )}
                    </Button>
                  )}
                  <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{recipe.title}</h2>
                    <p className="text-orange-100 text-lg leading-relaxed">{recipe.description}</p>
                    {recipe.dietaryBadges && recipe.dietaryBadges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {recipe.dietaryBadges.map((badge, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {recipe.imageUrl && (
                  <div className="relative w-full h-80 sm:h-96 group overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 flex flex-wrap gap-2 justify-end">
                      <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-800 backdrop-blur-sm shadow-sm" onClick={handleRegenerateImage}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-800 backdrop-blur-sm shadow-sm" onClick={handleDownloadImage}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-800 backdrop-blur-sm shadow-sm" onClick={handleShareImage}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-0">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 bg-orange-50 border-b border-orange-100 divide-y md:divide-y-0 md:divide-x divide-orange-200/50">
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <Clock className="w-5 h-5 text-orange-500 mb-1" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prep Time</span>
                      <span className="font-bold text-gray-900">{recipe.prepTime}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <Flame className="w-5 h-5 text-red-500 mb-1" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cook Time</span>
                      <span className="font-bold text-gray-900">{recipe.cookTime}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <Info className="w-5 h-5 text-blue-500 mb-1" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</span>
                      <span className="font-bold text-gray-900">{recipe.difficulty}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <Utensils className="w-5 h-5 text-green-500 mb-1" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Calories</span>
                      <span className="font-bold text-gray-900">{recipe.calories} kcal</span>
                    </div>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Left Column */}
                    <div className="md:col-span-1 space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          Ingredients
                        </h3>
                        <ul className="space-y-3">
                          {recipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-start text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">
                              <span className="text-orange-500 font-bold mr-3 mt-0.5">•</span>
                              <span className="leading-snug">{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {recipe.nutritionFacts && (
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                          <h4 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wider">Nutrition Facts</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-blue-200 pb-1">
                              <span className="text-blue-700">Protein</span>
                              <span className="font-bold text-blue-900">{recipe.nutritionFacts.protein}</span>
                            </div>
                            <div className="flex justify-between border-b border-blue-200 pb-1">
                              <span className="text-blue-700">Carbs</span>
                              <span className="font-bold text-blue-900">{recipe.nutritionFacts.carbs}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Fat</span>
                              <span className="font-bold text-blue-900">{recipe.nutritionFacts.fat}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-2 space-y-8">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-xl font-bold text-gray-900">Instructions</h3>
                          <Button 
                            onClick={() => setIsVoiceAssistantOpen(true)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200"
                            size="sm"
                          >
                            <Headphones className="w-4 h-4 mr-2" />
                            Cooking Mode
                          </Button>
                        </div>
                        <ol className="space-y-6">
                          {recipe.instructions.map((inst, idx) => (
                            <li key={idx} className="flex">
                              <div className="flex-shrink-0 mr-4">
                                <span className="flex items-center justify-center bg-orange-100 text-orange-600 font-extrabold rounded-full h-8 w-8 text-sm shadow-sm border border-orange-200">
                                  {idx + 1}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed mt-1">{inst}</p>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {recipe.chefTips && recipe.chefTips.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200/60 mt-8 relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 opacity-10">
                            <ChefHat className="w-24 h-24 text-amber-500" />
                          </div>
                          <h4 className="font-bold text-amber-900 mb-3 flex items-center text-lg relative z-10">
                            <ChefHat className="w-5 h-5 mr-2 text-amber-600" />
                            Chef's Tips
                          </h4>
                          <ul className="space-y-2 relative z-10">
                            {recipe.chefTips.map((tip, idx) => (
                              <li key={idx} className="flex items-start text-amber-800">
                                <span className="mr-2 text-amber-500">★</span>
                                <span className="text-sm">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {recipe.groceryList && recipe.groceryList.length > 0 && (
                        <GroceryPlanner groceryList={recipe.groceryList} recipeTitle={recipe.title} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {recipe && (
        <VoiceCookingAssistant 
          isOpen={isVoiceAssistantOpen}
          onClose={() => setIsVoiceAssistantOpen(false)}
          recipeTitle={recipe.title}
          instructions={recipe.instructions}
        />
      )}
    </div>
  );
}
