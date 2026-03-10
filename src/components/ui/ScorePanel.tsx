/**
 * ScorePanel — HUD overlay shown during gameplay.
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "@/types/game";
import { DIFFICULTY_CONFIGS } from "@/types/game";

interface Props {
  gs: GameState;
  onPause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export function ScorePanel({ gs, onPause, onToggleSound, onToggleMusic }: Props) {
  const maxLives = DIFFICULTY_CONFIGS[gs.difficulty].lives;

  return (
    <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
      {/* Main HUD bar */}
      <div className="flex items-start justify-between px-4 pt-3">

        {/* Left — Score */}
        <div className="min-w-[80px]">
          <motion.div
            key={gs.score}
            initial={{ scale: 1.4, color: "#e879f9" }}
            animate={{ scale: 1, color: "#e0d0ff" }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-black tabular-nums leading-none"
            style={{ textShadow: "0 0 10px #a855f7" }}
          >
            {gs.score.toLocaleString()}
          </motion.div>
          <div className="text-[10px] text-purple-400/70 mt-0.5 uppercase tracking-widest">Score</div>
        </div>

        {/* Centre — Lives + round */}
        <div className="flex flex-col items-center gap-1">
          {/* Lives as hearts */}
          <div className="flex gap-1">
            {Array.from({ length: maxLives }).map((_, i) => (
              <motion.span
                key={i}
                animate={{ scale: i < gs.lives ? 1 : 0.6, opacity: i < gs.lives ? 1 : 0.2 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-none"
                style={{ filter: i < gs.lives ? "drop-shadow(0 0 4px #f472b6)" : "none" }}
              >
                ♥
              </motion.span>
            ))}
          </div>
          <div className="text-[10px] text-cyan-400/80 uppercase tracking-widest">
            Round {gs.round}
          </div>
        </div>

        {/* Right — Best score + controls */}
        <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
          <div className="text-[10px] text-purple-400/70 uppercase tracking-widest">
            Best <span className="text-purple-200 font-bold">{gs.highScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleSound}
              title={gs.soundEnabled ? "Mute sound" : "Unmute sound"}
              className="text-base leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {gs.soundEnabled ? "🔊" : "🔇"}
            </button>
            <button
              onClick={onToggleMusic}
              title={gs.musicEnabled ? "Stop music" : "Play music"}
              className="text-base leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {gs.musicEnabled ? "🎵" : "🎶"}
            </button>
            <button
              onClick={onPause}
              className="text-[11px] font-bold px-2 py-0.5 border border-purple-500/50 rounded text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
            >
              ⏸
            </button>
          </div>
        </div>
      </div>

      {/* Combo badge — centred below HUD bar */}
      <div className="flex justify-center mt-1">
        <AnimatePresence>
          {gs.combo >= 2 && (
            <motion.div
              key={gs.combo}
              initial={{ opacity: 0, scale: 0.7, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-bold tracking-wider"
              style={{ textShadow: "0 0 8px #facc15" }}
            >
              ×{gs.combo} COMBO
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
