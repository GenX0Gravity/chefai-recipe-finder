"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, BookHeart, CalendarDays, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ savedRecipes: 0, collections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/recipes").then(res => res.json()),
        fetch("/api/collections").then(res => res.json())
      ]).then(([recipes, colls]) => {
        setStats({
          savedRecipes: Array.isArray(recipes) ? recipes.length : 0,
          collections: Array.isArray(colls) ? colls.length : 0
        });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500" />;
  }

  if (!session) {
    return (
      <div className="flex-1 w-full min-h-screen pt-24 px-4 bg-slate-50 dark:bg-black transition-colors duration-500">
        <EmptyState 
          icon={<User className="h-12 w-12 text-orange-500" />}
          title="Sign in required"
          description="You need to sign in to view your profile."
          actionLabel="Sign In Now"
          actionHref="/"
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full min-h-screen px-4 py-12 bg-slate-50 dark:bg-black transition-colors duration-500">
      {/* Decorative Blur */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <span className="text-4xl font-bold text-white">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Welcome, {session.user?.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <Mail className="w-4 h-4 mr-2" />
            {session.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
              <CardContent className="p-6 flex items-center">
                <div className="bg-orange-500/10 p-4 rounded-2xl mr-4">
                  <BookHeart className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Recipes Saved</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {loading ? "-" : stats.savedRecipes}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
              <CardContent className="p-6 flex items-center">
                <div className="bg-amber-500/10 p-4 rounded-2xl mr-4">
                  <CalendarDays className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Collections</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {loading ? "-" : stats.collections}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
              <CardContent className="p-6 flex items-center">
                <div className="bg-blue-500/10 p-4 rounded-2xl mr-4">
                  <Settings className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Account</p>
                  <Button variant="link" className="p-0 h-auto font-bold text-blue-500 mt-1">
                    Manage Settings &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="glass-card border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 px-8 rounded-full"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
