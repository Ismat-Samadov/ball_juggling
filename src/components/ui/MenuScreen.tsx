/**
 * MenuScreen — Main title / start screen overlay.
 */
"use client";

import { motion } from "framer-motion";
import type { Difficulty, GameState } from "@/types/game";
import { DIFFICULTY_CONFIGS } from "@/types/game";
import { NeonButton } from "./NeonButton";

interface Props {
  gs: GameState;
  onStart: (d: Difficulty) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function MenuScreen({ gs, onStart, onSelectDifficulty, onToggleSound, onToggleMusic }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#07051a]/80 backdrop-blur-sm"
    >
      {/* Title */}
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="text-5xl sm:text-7xl font-black tracking-widest text-white mb-1 neon-text"
      >
        JUGGLE
      </motion.h1>
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-cyan-400 text-sm sm:text-base tracking-[0.3em] uppercase mb-8 neon-cyan"
      >
        Neon Ball Arcade
      </motion.p>

      {/* High score */}
      {gs.highScore > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-6 px-6 py-2 glass rounded-full text-purple-300 text-sm"
        >
          Best Score: <span className="font-bold text-purple-100">{gs.highScore.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Difficulty selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3 mb-8"
      >
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => onSelectDifficulty(d)}
            className={`
              px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${gs.difficulty === d
                ? "bg-purple-500/50 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                : "bg-white/5 border-white/20 text-white/60 hover:border-white/40 hover:text-white/80"
              }
            `}
          >
            {DIFFICULTY_CONFIGS[d].label}
          </button>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <NeonButton onClick={() => onStart(gs.difficulty)} className="text-lg px-12 py-4">
          Start Game
        </NeonButton>
      </motion.div>

      {/* How to play */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 glass rounded-xl px-6 py-4 max-w-xs text-center"
      >
        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">How to Play</p>
        <p className="text-white/60 text-xs leading-relaxed">
          Move the paddle to keep all balls in the air.
          <br />Desktop: mouse or ← → keys
          <br />Mobile: drag your finger
          <br />Press <kbd className="bg-white/10 px-1 rounded">Esc</kbd> or <kbd className="bg-white/10 px-1 rounded">P</kbd> to pause
        </p>
      </motion.div>

      {/* Audio toggles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex gap-6"
      >
        <button onClick={onToggleSound} className="text-white/50 hover:text-white text-xs flex items-center gap-1 cursor-pointer">
          {gs.soundEnabled ? "🔊" : "🔇"} Sound
        </button>
        <button onClick={onToggleMusic} className="text-white/50 hover:text-white text-xs flex items-center gap-1 cursor-pointer">
          🎵 Music {gs.musicEnabled ? "On" : "Off"}
        </button>
      </motion.div>
    </motion.div>
  );
}
