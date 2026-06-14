"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ChefHat, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-orange-500/10 p-2 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <ChefHat className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300">
              ChefAI
            </span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link href="/generate" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              Generate
            </Link>
            <Link href="/premium" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-3 py-2 rounded-md flex items-center transition-colors">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Premium
            </Link>
            {session ? (
              <>
                <Link href="/saved" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  Cookbook
                </Link>
                <Link href="/profile" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
                <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn()} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                Sign In
              </Button>
            )}

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <Sun className="h-5 w-5 text-orange-300" /> : <Moon className="h-5 w-5 text-slate-700" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
