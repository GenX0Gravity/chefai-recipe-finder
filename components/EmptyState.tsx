import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl"
    >
      <div className="bg-orange-500/10 dark:bg-orange-500/20 p-6 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-orange-500/30">
            {actionLabel}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
