/**
 * NeonButton — reusable glowing button with hover/press animations.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
  small?: boolean;
}

const VARIANTS = {
  primary: "bg-purple-600/30 border-purple-400 text-purple-200 hover:bg-purple-500/50 hover:border-purple-300",
  secondary: "bg-cyan-600/20 border-cyan-400 text-cyan-200 hover:bg-cyan-500/40 hover:border-cyan-300",
  danger: "bg-red-600/20 border-red-400 text-red-200 hover:bg-red-500/40 hover:border-red-300",
};

export function NeonButton({ onClick, children, variant = "primary", className = "", disabled, small }: Props) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        border rounded-lg font-bold tracking-wider uppercase
        transition-colors duration-200 cursor-pointer
        backdrop-blur-sm select-none
        ${small ? "px-4 py-2 text-xs" : "px-8 py-3 text-sm"}
        ${VARIANTS[variant]}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}
      `}
      style={{
        boxShadow: disabled ? "none" : undefined,
      }}
    >
      {children}
    </motion.button>
  );
}
