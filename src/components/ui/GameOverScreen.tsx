/**
 * GameOverScreen — End-game overlay with animated stats.
 */
"use client";

import { motion } from "framer-motion";
import type { GameState } from "@/types/game";
import { NeonButton } from "./NeonButton";

interface Props {
  gs: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

const stat = (label: string, value: string | number, delay: number) => (
  <motion.div
    key={label}
    initial={{ x: -30, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay }}
    className="flex justify-between gap-12 text-sm"
  >
    <span className="text-white/50">{label}</span>
    <span className="font-bold text-purple-200">{value}</span>
  </motion.div>
);

export function GameOverScreen({ gs, onRestart, onMenu }: Props) {
  const isNewHigh = gs.score > 0 && gs.score >= gs.highScore;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#07051a]/90 backdrop-blur-md"
    >
      {/* Title */}
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="text-5xl font-black tracking-widest text-red-400 mb-1"
        style={{ textShadow: "0 0 20px rgba(248,113,113,0.8)" }}
      >
        GAME OVER
      </motion.h2>

      {isNewHigh && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 px-4 py-1 bg-yellow-400/20 border border-yellow-400 rounded-full text-yellow-300 text-xs font-bold tracking-widest"
          style={{ textShadow: "0 0 8px #facc15" }}
        >
          ★ NEW HIGH SCORE ★
        </motion.div>
      )}

      {/* Stats panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl px-8 py-6 mt-6 mb-8 min-w-[240px] space-y-3"
      >
        {stat("Score", gs.score.toLocaleString(), 0.4)}
        {stat("Best Score", gs.highScore.toLocaleString(), 0.5)}
        {stat("Max Combo", `x${gs.maxCombo}`, 0.6)}
        {stat("Round Reached", gs.round, 0.7)}
        {stat("Difficulty", gs.difficulty.charAt(0).toUpperCase() + gs.difficulty.slice(1), 0.8)}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col gap-3"
      >
        <NeonButton onClick={onRestart}>Play Again</NeonButton>
        <NeonButton onClick={onMenu} variant="secondary">Main Menu</NeonButton>
      </motion.div>
    </motion.div>
  );
}
