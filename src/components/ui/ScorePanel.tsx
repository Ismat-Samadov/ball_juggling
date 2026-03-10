/**
 * ScorePanel — HUD overlay shown during gameplay.
 * Positioned absolutely over the canvas.
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "@/types/game";

interface Props {
  gs: GameState;
  onPause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export function ScorePanel({ gs, onPause, onToggleSound, onToggleMusic }: Props) {
  return (
    <div className="absolute inset-x-0 top-0 flex items-start justify-between px-3 pt-2 pointer-events-none z-10">
      {/* Left — Score + Combo */}
      <div className="pointer-events-none">
        <motion.div
          key={gs.score}
          initial={{ scale: 1.3, color: "#e879f9" }}
          animate={{ scale: 1, color: "#e0d0ff" }}
          transition={{ duration: 0.25 }}
          className="text-xl font-bold tabular-nums"
          style={{ textShadow: "0 0 8px #a855f7" }}
        >
          {gs.score.toLocaleString()}
        </motion.div>
        <div className="text-xs text-purple-400 mt-0.5">Score</div>

        <AnimatePresence>
          {gs.combo >= 2 && (
            <motion.div
              key={gs.combo}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-sm font-bold text-yellow-300"
              style={{ textShadow: "0 0 8px #facc15" }}
            >
              x{gs.combo} Combo
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centre — Ball counter + Round */}
      <div className="flex flex-col items-center pointer-events-none">
        <div className="text-xs text-cyan-400">Balls: {gs.ballCount}</div>
        <div className="text-xs text-cyan-300/70 mt-0.5">Round {gs.round}</div>
      </div>

      {/* Right — High score + controls */}
      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-purple-400/80">Best: {gs.highScore.toLocaleString()}</div>
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={onToggleSound}
            className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            title="Toggle sound"
          >
            {gs.soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            onClick={onToggleMusic}
            className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            title="Toggle music"
          >
            {gs.musicEnabled ? "🎵" : "🎵"}
          </button>
          <button
            onClick={onPause}
            className="text-xs font-bold px-2 py-0.5 border border-purple-500/60 rounded text-purple-300 hover:bg-purple-500/20 transition-colors pointer-events-auto cursor-pointer"
          >
            ⏸
          </button>
        </div>
      </div>
    </div>
  );
}
