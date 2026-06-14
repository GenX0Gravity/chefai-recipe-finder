"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarDays, Loader2, Save, CheckCircle2, Download, Flame, Utensils } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

type Meal = {
  title: string;
  description: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
};

type DayPlan = {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  totalCalories: number;
};

function MealPlannerContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "daily"; // "daily" or "weekly"
  const isWeekly = type === "weekly";

  const [diet, setDiet] = useState("Balanced");
  const [targetCalories, setTargetCalories] = useState("2000");
  const [allergies, setAllergies] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DayPlan[] | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("/api/premium/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, diet, targetCalories, allergies })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate meal plan");
      
      setPlan(data.plan);
      toast.success("Meal plan generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`My ${isWeekly ? 'Weekly' : 'Daily'} Meal Plan`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Diet: ${diet} | Target: ${targetCalories} kcal/day`, 14, 28);

    let startY = 36;

    plan.forEach((dayPlan, index) => {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
      
      doc.setFontSize(16);
      doc.text(`${dayPlan.day} (${dayPlan.totalCalories} kcal)`, 14, startY);
      startY += 6;

      const tableData = [
        ["Breakfast", dayPlan.meals.breakfast.title, `${dayPlan.meals.breakfast.calories} kcal`],
        ["Lunch", dayPlan.meals.lunch.title, `${dayPlan.meals.lunch.calories} kcal`],
        ["Dinner", dayPlan.meals.dinner.title, `${dayPlan.meals.dinner.calories} kcal`],
        ["Snack", dayPlan.meals.snack.title, `${dayPlan.meals.snack.calories} kcal`],
      ];

      autoTable(doc, {
        startY: startY,
        head: [["Meal", "Recipe", "Calories"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [249, 115, 22] }, // Orange
      });

      startY = (doc as any).lastAutoTable.finalY + 14;
    });

    doc.save(`${isWeekly ? 'weekly' : 'daily'}-meal-plan.pdf`);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-12 w-full min-h-screen">
      {/* Decorative Blur */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3 tracking-tight">
          {isWeekly ? <CalendarDays className="w-10 h-10 text-indigo-500" /> : <Calendar className="w-10 h-10 text-blue-500" />}
          {isWeekly ? "Weekly Diet Planner" : "AI Meal Planner"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Generate a comprehensive, fully tailored {isWeekly ? '7-day' : 'daily'} meal plan that hits your specific macronutrient and calorie goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xl border-white/20 glass-card bg-white/60 dark:bg-black/40">
            <CardHeader className="border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Utensils className="w-5 h-5 mr-2 text-orange-500" />
                Plan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Diet</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 dark:text-white"
                  value={diet}
                  onChange={e => setDiet(e.target.value)}
                >
                  <option>Balanced</option>
                  <option>Keto</option>
                  <option>Paleo</option>
                  <option>Vegan</option>
                  <option>Vegetarian</option>
                  <option>Mediterranean</option>
                  <option>High Protein</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Calorie Target</Label>
                <div className="relative">
                  <Flame className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    type="number" 
                    value={targetCalories}
                    onChange={e => setTargetCalories(e.target.value)}
                    className="pl-10 dark:bg-black/50 dark:border-white/10 dark:text-white" 
                    placeholder="e.g. 2000"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">kcal</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Allergies / Dislikes (Optional)</Label>
                <Input 
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="e.g. Peanuts, Shellfish, Mushrooms"
                  className="dark:bg-black/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generate Plan"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-3xl p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 animate-spin text-blue-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-2">Architecting your meal plan...</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">Our AI nutritionist is balancing macros and selecting the perfect recipes.</p>
            </div>
          ) : plan ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between glass-card p-4 rounded-2xl shadow-lg border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Plan Generated Successfully</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Optimized for {targetCalories} kcal/day on a {diet} diet.</p>
                  </div>
                </div>
                <Button onClick={exportPDF} variant="outline" className="flex items-center dark:bg-white/5 dark:text-white">
                  <Download className="w-4 h-4 mr-2" /> Export PDF
                </Button>
              </div>

              <div className="space-y-6">
                {plan.map((dayPlan, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden border border-white/20 dark:border-white/10 shadow-xl glass-card">
                      <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg">{dayPlan.day}</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {dayPlan.totalCalories} kcal Total
                        </span>
                      </div>
                      <div className="divide-y divide-white/10 dark:divide-white/5 bg-white/40 dark:bg-black/40">
                        {[
                          { name: "Breakfast", data: dayPlan.meals.breakfast },
                          { name: "Lunch", data: dayPlan.meals.lunch },
                          { name: "Dinner", data: dayPlan.meals.dinner },
                          { name: "Snack", data: dayPlan.meals.snack }
                        ].map(meal => (
                          <div key={meal.name} className="p-4 hover:bg-white/60 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="w-24 font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-xs flex-shrink-0">
                              {meal.name}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{meal.data.title}</h4>
                              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{meal.data.description}</p>
                            </div>
                            <div className="flex sm:flex-col gap-3 sm:gap-1 text-sm bg-white/50 dark:bg-black/50 p-2 rounded-md sm:w-32 flex-shrink-0 sm:items-end border border-white/20 dark:border-white/5">
                              <span className="font-bold text-slate-900 dark:text-white">{meal.data.calories} kcal</span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs">P: {meal.data.protein} | C: {meal.data.carbs}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState 
              icon={<CalendarDays className="w-12 h-12 text-blue-500" />}
              title="No Plan Generated Yet"
              description="Configure your preferences on the left and click generate to build your custom meal schedule."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MealPlannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>}>
      <MealPlannerContent />
    </Suspense>
  );
}
