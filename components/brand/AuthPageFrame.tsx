"use client";

import { motion } from "framer-motion";

export function AuthPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}
