/**
 * PauseScreen — Pause overlay.
 */
"use client";

import { motion } from "framer-motion";
import type { GameState } from "@/types/game";
import { NeonButton } from "./NeonButton";

interface Props {
  gs: GameState;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function PauseScreen({ gs, onResume, onRestart, onMenu }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#07051a]/85 backdrop-blur-md"
    >
      <motion.h2
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-4xl font-black tracking-widest text-purple-300 mb-2 neon-text"
      >
        PAUSED
      </motion.h2>

      <div className="glass rounded-xl px-8 py-6 mt-4 mb-8 min-w-[200px] text-center">
        <div className="text-white/50 text-xs mb-1">Current Score</div>
        <div className="text-3xl font-bold text-purple-200">{gs.score.toLocaleString()}</div>
        <div className="text-white/40 text-xs mt-2">Combo: {gs.combo} | Round: {gs.round}</div>
      </div>

      <div className="flex flex-col gap-3">
        <NeonButton onClick={onResume}>Resume</NeonButton>
        <NeonButton onClick={onRestart} variant="secondary">Restart</NeonButton>
        <NeonButton onClick={onMenu} variant="danger">Main Menu</NeonButton>
      </div>

      <p className="mt-6 text-white/30 text-xs">Press Esc or P to resume</p>
    </motion.div>
  );
}
