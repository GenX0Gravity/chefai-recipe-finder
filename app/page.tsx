"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Utensils, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 w-full overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/20 dark:bg-orange-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-400/10 dark:bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center p-4 glass-card rounded-2xl mb-8"
          >
            <ChefHat className="h-10 w-10 text-orange-600 dark:text-orange-500 drop-shadow-md" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
            Your Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-300 text-glow">
              AI Chef
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-slate-600 dark:text-slate-300 mx-auto mb-12 leading-relaxed">
            Tell us what ingredients you have in your kitchen, and we'll instantly generate delicious, tailored recipes just for you. No more wondering what's for dinner.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 border border-orange-400/50 text-white transition-all group">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Start Cooking Now
              </Button>
            </Link>
            <Link href="/premium">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-all border-slate-200 dark:border-white/10 dark:text-white">
                Explore Premium
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Utensils className="h-8 w-8 text-orange-500 dark:text-orange-400" />,
                title: "Zero Waste",
                description: "Use exactly what you have. We'll find a way to make it delicious."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-orange-500 dark:text-orange-400" />,
                title: "AI-Powered Creativity",
                description: "Discover unique flavor combinations you'd never think of yourself."
              },
              {
                icon: <Clock className="h-8 w-8 text-orange-500 dark:text-orange-400" />,
                title: "Save Time",
                description: "Stop scrolling for recipes. Get immediate, customized instructions."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="p-8 rounded-3xl glass-card hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="mb-6 bg-white/80 dark:bg-black/50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/20 dark:border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
