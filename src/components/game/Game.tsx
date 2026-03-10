/**
 * Game — Top-level component that wires canvas, engine, and UI layers.
 */
"use client";

import { AnimatePresence } from "framer-motion";
import { useGameEngine } from "@/hooks/useGameEngine";
import { GameCanvas } from "./GameCanvas";
import { ScorePanel } from "@/components/ui/ScorePanel";
import { MenuScreen } from "@/components/ui/MenuScreen";
import { PauseScreen } from "@/components/ui/PauseScreen";
import { GameOverScreen } from "@/components/ui/GameOverScreen";
import { MobileControls } from "@/components/ui/MobileControls";

export function Game() {
  const {
    canvasRef,
    gameState: gs,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    goToMenu,
    toggleSound,
    toggleMusic,
    setDifficulty,
  } = useGameEngine();

  return (
    /* Full-viewport container — canvas sits behind, UI floats above */
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a] select-none">
      {/* Canvas always rendered so resize observer has a target */}
      <GameCanvas canvasRef={canvasRef} />

      {/* HUD — only during play */}
      {gs.phase === "playing" && (
        <ScorePanel
          gs={gs}
          onPause={pauseGame}
          onToggleSound={toggleSound}
          onToggleMusic={toggleMusic}
        />
      )}

      {/* Mobile arrow buttons — only during play */}
      {gs.phase === "playing" && (
        <MobileControls onLeft={() => {}} onRight={() => {}} />
      )}

      {/* Overlay screens (animated in/out) */}
      <AnimatePresence mode="wait">
        {gs.phase === "menu" && (
          <MenuScreen
            key="menu"
            gs={gs}
            onStart={startGame}
            onSelectDifficulty={setDifficulty}
            onToggleSound={toggleSound}
            onToggleMusic={toggleMusic}
          />
        )}

        {gs.phase === "paused" && (
          <PauseScreen
            key="pause"
            gs={gs}
            onResume={resumeGame}
            onRestart={restartGame}
            onMenu={goToMenu}
          />
        )}

        {gs.phase === "gameover" && (
          <GameOverScreen
            key="gameover"
            gs={gs}
            onRestart={restartGame}
            onMenu={goToMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
