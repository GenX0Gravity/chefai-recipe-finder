"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat, Clock, Flame, Utensils, Heart, Trash2, Edit3, Folder, Plus, Check, Headphones, ShoppingCart, X } from "lucide-react";
import VoiceCookingAssistant from "@/components/VoiceCookingAssistant";
import GroceryPlanner, { GroceryItem } from "@/components/GroceryPlanner";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

type Recipe = {
  id: string;
  title: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  calories?: number;
  difficulty?: string;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
  isHistory: boolean;
  notes?: string;
  collectionId?: string;
  favorites: { id: string }[];
  collection?: { id: string; name: string };
  groceryList?: GroceryItem[];
};

type Collection = {
  id: string;
  name: string;
};

export default function SavedRecipesPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cookbook" | "history" | "favorites">("cookbook");
  const [activeCollection, setActiveCollection] = useState<string>("all");
  
  // UI States
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [activeVoiceRecipe, setActiveVoiceRecipe] = useState<Recipe | null>(null);
  const [activeGroceryRecipe, setActiveGroceryRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchData();
  }, [session]);

  async function fetchData() {
    try {
      const [resRecipes, resColls] = await Promise.all([
        fetch("/api/recipes"),
        fetch("/api/collections")
      ]);
      if (resRecipes.ok) {
        const data = await resRecipes.json();
        setRecipes(data);
        setCollections(await resColls.json());
      } else {
        toast.error("Failed to load recipes");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: recipe.id })
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(recipes.map(r => 
          r.id === recipe.id ? { ...r, favorites: data.favorited ? [{ id: 'temp' }] : [] } : r
        ));
      }
    } catch (e) { console.error(e); }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      setRecipes(recipes.filter(r => r.id !== id));
      toast.success("Recipe deleted from cookbook");
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const saveNotes = async (id: string) => {
    try {
      await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue })
      });
      setRecipes(recipes.map(r => r.id === id ? { ...r, notes: notesValue } : r));
      setEditingNotes(null);
    } catch (e) { console.error(e); }
  };

  const moveToCollection = async (recipeId: string, collId: string | null) => {
    try {
      await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: collId })
      });
      setRecipes(recipes.map(r => r.id === recipeId ? { ...r, collectionId: collId || undefined } : r));
    } catch (e) { console.error(e); }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName })
      });
      const data = await res.json();
      if (data.id) {
        setCollections([data, ...collections]);
        setNewCollectionName("");
      }
    } catch (e) { console.error(e); }
  };

  const filteredRecipes = recipes.filter(r => {
    if (activeTab === "history") return r.isHistory;
    if (activeTab === "favorites") return r.favorites && r.favorites.length > 0;
    // cookbook
    if (r.isHistory) return false;
    if (activeCollection !== "all") return r.collectionId === activeCollection;
    return true;
  });

  if (!session) {
    return (
      <div className="flex-1 w-full min-h-screen pt-24 px-4 bg-slate-50 dark:bg-black transition-colors duration-500">
        <EmptyState 
          icon={<ChefHat className="h-12 w-12 text-orange-500" />}
          title="Sign in required"
          description="You need to sign in to view your saved recipes."
          actionLabel="Sign In Now"
          actionHref="/"
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full min-h-screen px-4 py-12 bg-slate-50 dark:bg-black transition-colors duration-500">
      {/* Decorative Blur */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Cookbook</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">All your saved and favorite generated recipes in one place.</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-px mb-6">
          {(["cookbook", "favorites", "history"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm capitalize rounded-t-lg transition-colors ${
                activeTab === tab 
                ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Collections Filter */}
        {activeTab === "cookbook" && (
          <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Collections:</span>
            <button 
              onClick={() => setActiveCollection("all")}
              className={`px-3 py-1 text-sm rounded-full ${activeCollection === "all" ? "bg-gray-800 text-white" : "bg-white border text-gray-600"}`}
            >
              All Recipes
            </button>
            {collections.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCollection(c.id)}
                className={`px-3 py-1 text-sm rounded-full ${activeCollection === c.id ? "bg-orange-500 text-white" : "bg-white border text-gray-600"}`}
              >
                {c.name}
              </button>
            ))}
            <div className="flex ml-auto gap-2">
              <Input 
                value={newCollectionName} 
                onChange={e => setNewCollectionName(e.target.value)} 
                placeholder="New Collection..." 
                className="h-8 text-sm w-40" 
              />
              <Button size="sm" onClick={createCollection} className="h-8 px-2"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-full rounded-3xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/5 shadow-xl glass-card" />)}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <EmptyState 
          icon={<Folder className="h-12 w-12 text-orange-500" />}
          title={activeTab !== "cookbook" || activeCollection !== "all" ? "No matches found" : "Your Cookbook is Empty"}
          description={activeTab !== "cookbook" || activeCollection !== "all" ? "Try adjusting your filters." : "Go generate some amazing meals and save them here!"}
          actionLabel="Generate Recipe"
          actionHref="/generate"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all border-white/20 dark:border-white/10 overflow-hidden glass-card">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 pr-14">
                      <h3 className="font-bold text-xl line-clamp-1">{recipe.title}</h3>
                      {recipe.description && <p className="text-sm text-orange-100 line-clamp-1 mt-1">{recipe.description}</p>}
                    </div>
                    <button 
                      onClick={() => toggleFavorite(recipe)}
                      className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <Heart className={`w-5 h-5 ${recipe.favorites && recipe.favorites.length > 0 ? "fill-white text-white" : "text-white"}`} />
                    </button>
                  </div>
                  
                  <CardContent className="flex-1 p-5 flex flex-col">
                    <div className="flex gap-4 mb-4 text-xs font-medium text-gray-500">
                      {recipe.prepTime && <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {recipe.prepTime}</span>}
                      {recipe.calories && <span className="flex items-center"><Utensils className="w-3.5 h-3.5 mr-1" /> {recipe.calories} kcal</span>}
                      <div className="flex ml-auto gap-2">
                        {recipe.groceryList && recipe.groceryList.length > 0 && (
                          <button onClick={() => setActiveGroceryRecipe(recipe)} className="flex items-center text-orange-600 hover:text-orange-700 font-bold bg-orange-100 px-2 py-1 rounded transition-colors" title="View Grocery List">
                            <ShoppingCart className="w-3 h-3 mr-1" /> List
                          </button>
                        )}
                        <button onClick={() => setActiveVoiceRecipe(recipe)} className="flex items-center text-amber-600 hover:text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded transition-colors" title="Cooking Mode">
                          <Headphones className="w-3 h-3 mr-1" /> Cook
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      {editingNotes === recipe.id ? (
                        <div className="space-y-2">
                          <textarea 
                            className="w-full text-sm border rounded-md p-2 h-20 bg-amber-50 focus:ring-amber-200 outline-none" 
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Add your personal notes here..."
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveNotes(recipe.id)} className="h-7 text-xs bg-amber-600 hover:bg-amber-700">Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)} className="h-7 text-xs">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative bg-amber-50/50 rounded-lg p-3 border border-amber-100 hover:border-amber-200 transition-colors cursor-pointer" onClick={() => { setEditingNotes(recipe.id); setNotesValue(recipe.notes || ""); }}>
                          <p className="text-sm text-amber-900/80 italic line-clamp-3">
                            {recipe.notes || "Click to add personal notes..."}
                          </p>
                          <Edit3 className="w-4 h-4 text-amber-600/50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="bg-gray-50 p-4 border-t flex items-center justify-between gap-2">
                    {/* Collection Select */}
                    {activeTab !== "history" ? (
                      <select 
                        className="text-xs border rounded px-2 py-1.5 bg-white text-gray-600 flex-1 outline-none focus:ring-1 focus:ring-orange-500"
                        value={recipe.collectionId || ""}
                        onChange={(e) => moveToCollection(recipe.id, e.target.value || null)}
                      >
                        <option value="">No Collection</option>
                        {collections.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                       <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                          fetch(`/api/recipes/${recipe.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isHistory: false })
                          }).then(() => fetchData());
                       }}>
                         Save to Cookbook
                       </Button>
                    )}
                    
                    <button onClick={() => deleteRecipe(recipe.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {activeVoiceRecipe && (
        <VoiceCookingAssistant 
          isOpen={!!activeVoiceRecipe}
          onClose={() => setActiveVoiceRecipe(null)}
          recipeTitle={activeVoiceRecipe.title}
          instructions={activeVoiceRecipe.instructions}
        />
      )}

      {/* Grocery Planner Modal */}
      {activeGroceryRecipe && activeGroceryRecipe.groceryList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b z-10 flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                Shopping List for {activeGroceryRecipe.title}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setActiveGroceryRecipe(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <GroceryPlanner 
                groceryList={activeGroceryRecipe.groceryList} 
                recipeTitle={activeGroceryRecipe.title} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
