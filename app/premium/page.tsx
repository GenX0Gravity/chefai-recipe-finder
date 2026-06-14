import Link from "next/link";
import { 
  Calendar, 
  CalendarDays, 
  PackageOpen, 
  PartyPopper, 
  Wallet, 
  Scale, 
  Dumbbell, 
  Baby, 
  HeartHandshake, 
  MapPin 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PremiumDashboard() {
  const tools = [
    {
      title: "AI Meal Planner",
      description: "Generate a complete daily meal plan (Breakfast, Lunch, Dinner).",
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      href: "/premium/planner?type=daily",
      color: "bg-blue-50 border-blue-200 hover:border-blue-400"
    },
    {
      title: "Weekly Diet Planner",
      description: "Plan your entire week of meals tailored to your diet goals.",
      icon: <CalendarDays className="w-8 h-8 text-indigo-500" />,
      href: "/premium/planner?type=weekly",
      color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400"
    },
    {
      title: "Leftover Generator",
      description: "Zero-waste recipes using ONLY what you have left in the fridge.",
      icon: <PackageOpen className="w-8 h-8 text-emerald-500" />,
      href: "/premium/recipe/leftover",
      color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400"
    },
    {
      title: "Festival Generator",
      description: "Special occasion and festive recipes to celebrate in style.",
      icon: <PartyPopper className="w-8 h-8 text-pink-500" />,
      href: "/premium/recipe/festival",
      color: "bg-pink-50 border-pink-200 hover:border-pink-400"
    },
    {
      title: "Budget Meals",
      description: "Delicious, highly economical recipes that won't break the bank.",
      icon: <Wallet className="w-8 h-8 text-green-600" />,
      href: "/premium/recipe/budget",
      color: "bg-green-50 border-green-200 hover:border-green-400"
    },
    {
      title: "Weight Loss",
      description: "Low-calorie, highly satiating meals to support your weight loss journey.",
      icon: <Scale className="w-8 h-8 text-teal-500" />,
      href: "/premium/recipe/weight-loss",
      color: "bg-teal-50 border-teal-200 hover:border-teal-400"
    },
    {
      title: "Muscle Gain",
      description: "High-protein, nutrient-dense meals for bulking and recovery.",
      icon: <Dumbbell className="w-8 h-8 text-rose-500" />,
      href: "/premium/recipe/muscle-gain",
      color: "bg-rose-50 border-rose-200 hover:border-rose-400"
    },
    {
      title: "Kids-Friendly",
      description: "Fun, healthy, and picky-eater approved recipes for children.",
      icon: <Baby className="w-8 h-8 text-sky-500" />,
      href: "/premium/recipe/kids-friendly",
      color: "bg-sky-50 border-sky-200 hover:border-sky-400"
    },
    {
      title: "Senior Citizen",
      description: "Easy to chew, highly digestible, and nutritious meals for seniors.",
      icon: <HeartHandshake className="w-8 h-8 text-purple-500" />,
      href: "/premium/recipe/senior-citizen",
      color: "bg-purple-50 border-purple-200 hover:border-purple-400"
    },
    {
      title: "Regional Indian",
      description: "Authentic, traditional regional Indian cuisine (Chettinad, Bengali, etc.).",
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      href: "/premium/recipe/regional-indian",
      color: "bg-orange-50 border-orange-200 hover:border-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">ChefAI</span> Tools
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unlock specialized AI models trained for specific dietary goals, cuisines, and culinary situations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, idx) => (
            <Link key={idx} href={tool.href} className="block group">
              <Card className={`h-full transition-all duration-300 border-2 shadow-sm group-hover:shadow-md ${tool.color}`}>
                <CardHeader>
                  <div className="mb-4 bg-white/60 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
                    {tool.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 font-medium leading-relaxed text-sm">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
