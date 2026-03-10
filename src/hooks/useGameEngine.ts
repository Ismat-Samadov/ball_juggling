/**
 * useGameEngine.ts
 * Core game loop hook — manages all mutable game state via refs,
 * exposes a stable API to the canvas component.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ball, Difficulty, GamePhase, GameState, Paddle } from "@/types/game";
import { DIFFICULTY_CONFIGS } from "@/types/game";
import type { Particle } from "@/types/game";
import type { ComboPopup } from "@/utils/renderer";
import {
  createBall,
  resolveBallCollisions,
  stepBall,
  stepParticles,
  BALL_RADIUS,
  PADDLE_HEIGHT,
} from "@/utils/physics";
import {
  drawBackground,
  drawBall,
  drawComboPopups,
  drawLives,
  drawPaddle,
  drawParticles,
} from "@/utils/renderer";
import {
  playComboSound,
  playGameOverSound,
  playHitSound,
  playMissSound,
  playSpawnSound,
  resumeAudio,
  startMusic,
  stopMusic,
} from "@/utils/sound";
import {
  getDifficulty,
  getHighScore,
  getMusicEnabled,
  getSoundEnabled,
  saveHighScore,
} from "@/utils/storage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EngineAPI {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  startGame: (difficulty?: Difficulty) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setDifficulty: (d: Difficulty) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameEngine(): EngineAPI {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game-loop state stored in refs (avoids re-render per frame)
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<ComboPopup[]>([]);
  const paddleRef = useRef<Paddle>({ x: 0, y: 0, width: 100, height: PADDLE_HEIGHT, vx: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const mouseXRef = useRef<number | null>(null);
  const touchXRef = useRef<number | null>(null);

  // React state — only for UI re-renders
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: "menu",
    score: 0,
    highScore: getHighScore(),
    combo: 0,
    maxCombo: 0,
    ballCount: 1,
    lives: 3,
    round: 1,
    difficulty: getDifficulty(),
    soundEnabled: getSoundEnabled(),
    musicEnabled: getMusicEnabled(),
  }));

  // Mirror for use inside loop without stale closure
  const gsRef = useRef<GameState>(gameState);
  useEffect(() => { gsRef.current = gameState; }, [gameState]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const updateGs = useCallback((partial: Partial<GameState>) => {
    setGameState((prev) => {
      const next = { ...prev, ...partial };
      gsRef.current = next;
      return next;
    });
  }, []);

  const spawnBall = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cfg = DIFFICULTY_CONFIGS[gsRef.current.difficulty];
    if (ballsRef.current.length >= cfg.maxBalls) return;
    ballsRef.current.push(createBall(canvas.width, canvas.height, cfg.speedMult));
    playSpawnSound(gsRef.current.soundEnabled);
    updateGs({ ballCount: ballsRef.current.length });
  }, [updateGs]);

  // ─── Game loop ───────────────────────────────────────────────────────────────

  const loop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const gs = gsRef.current;
    if (gs.phase !== "playing") return;

    // Fixed timestep cap
    const dt = Math.min(timestamp - lastTimestampRef.current, 32);
    lastTimestampRef.current = timestamp;
    if (dt === 0) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const cfg = DIFFICULTY_CONFIGS[gs.difficulty];
    const W = canvas.width;
    const H = canvas.height;

    // ── Paddle movement ────────────────────────────────────────────────────────
    const paddle = paddleRef.current;
    const prevX = paddle.x;

    // Keyboard
    if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) {
      paddle.x = Math.max(paddle.width / 2, paddle.x - cfg.paddleSpeed);
    }
    if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) {
      paddle.x = Math.min(W - paddle.width / 2, paddle.x + cfg.paddleSpeed);
    }

    // Mouse / touch override
    const targetX = touchXRef.current ?? mouseXRef.current;
    if (targetX !== null) {
      const clamped = Math.max(paddle.width / 2, Math.min(W - paddle.width / 2, targetX));
      paddle.x += (clamped - paddle.x) * 0.2; // smooth follow
    }

    paddle.vx = paddle.x - prevX;
    paddle.y = H - 50;

    // ── Physics ────────────────────────────────────────────────────────────────
    const newParticles: Particle[] = [];
    let missCount = 0;

    ballsRef.current = ballsRef.current.filter((ball) => {
      const fell = stepBall(ball, cfg.gravity, W, H, paddle, newParticles, (b) => {
        const newCombo = gs.combo + 1;
        const pts = 1 + Math.floor(newCombo / 3);

        // Combo popup
        if (newCombo >= 3) {
          popupsRef.current.push({
            text: `x${newCombo} COMBO!`,
            x: b.pos.x,
            y: b.pos.y - BALL_RADIUS - 10,
            life: 1,
            hue: b.hue,
          });
          playComboSound(newCombo, gs.soundEnabled);
        }

        const newScore = gs.score + pts;
        const newHigh = Math.max(newScore, gs.highScore);
        if (newHigh > gs.highScore) saveHighScore(newHigh);

        // New ball milestone
        const prevRound = Math.floor(gs.score / cfg.newBallEvery);
        const newRound = Math.floor(newScore / cfg.newBallEvery);
        if (newRound > prevRound) {
          setTimeout(spawnBall, 300);
        }

        updateGs({
          score: newScore,
          highScore: newHigh,
          combo: newCombo,
          maxCombo: Math.max(newCombo, gs.maxCombo),
          round: Math.floor(newScore / cfg.newBallEvery) + 1,
        });

        playHitSound(newCombo, gs.soundEnabled);
      });

      if (fell) {
        missCount++;
        return false; // remove ball
      }
      return true;
    });

    // Reset combo on any miss
    if (missCount > 0) {
      const newLives = gs.lives - missCount;
      playMissSound(gs.soundEnabled);
      updateGs({ combo: 0, lives: newLives });

      if (newLives <= 0) {
        // Game over
        playGameOverSound(gs.soundEnabled);
        stopMusic();
        updateGs({ phase: "gameover" });
        return;
      }
    }

    // Void combo reset after 3s of no hits handled via hit tracking — nothing extra needed here

    // Ball–ball collisions
    resolveBallCollisions(ballsRef.current);

    // Particles
    particlesRef.current = stepParticles([...particlesRef.current, ...newParticles]);

    // ── Draw ───────────────────────────────────────────────────────────────────
    drawBackground(ctx, W, H);
    drawParticles(ctx, particlesRef.current);
    ballsRef.current.forEach((b) => drawBall(ctx, b));
    drawPaddle(ctx, paddle);
    popupsRef.current = drawComboPopups(ctx, popupsRef.current);

    // Lives dots at top-centre
    drawLives(ctx, gsRef.current.lives, cfg.lives, W);

    rafRef.current = requestAnimationFrame(loop);
  }, [spawnBall, updateGs]);

  // ─── Public API ───────────────────────────────────────────────────────────────

  const startGame = useCallback((difficulty?: Difficulty) => {
    resumeAudio();
    const d = difficulty ?? gsRef.current.difficulty;
    const cfg = DIFFICULTY_CONFIGS[d];
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset
    ballsRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
    paddleRef.current = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 110,
      height: PADDLE_HEIGHT,
      vx: 0,
    };
    mouseXRef.current = null;
    touchXRef.current = null;

    // Spawn initial balls
    for (let i = 0; i < cfg.initialBalls; i++) {
      setTimeout(() => {
        ballsRef.current.push(createBall(canvas.width, canvas.height, cfg.speedMult));
        updateGs({ ballCount: ballsRef.current.length });
      }, i * 300);
    }

    updateGs({
      phase: "playing",
      score: 0,
      combo: 0,
      maxCombo: 0,
      ballCount: cfg.initialBalls,
      lives: cfg.lives,
      round: 1,
      difficulty: d,
    });

    cancelAnimationFrame(rafRef.current);
    lastTimestampRef.current = performance.now();

    if (gsRef.current.musicEnabled) startMusic();

    rafRef.current = requestAnimationFrame(loop);
  }, [loop, updateGs]);

  const pauseGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopMusic();
    updateGs({ phase: "paused" });
  }, [updateGs]);

  const resumeGame = useCallback(() => {
    updateGs({ phase: "playing" });
    if (gsRef.current.musicEnabled) startMusic();
    lastTimestampRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, updateGs]);

  const restartGame = useCallback(() => {
    stopMusic();
    startGame(gsRef.current.difficulty);
  }, [startGame]);

  const goToMenu = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopMusic();
    ballsRef.current = [];
    particlesRef.current = [];
    updateGs({ phase: "menu" });
  }, [updateGs]);

  const toggleSound = useCallback(() => {
    setGameState((prev) => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      gsRef.current = next;
      return next;
    });
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState((prev) => {
      const next = { ...prev, musicEnabled: !prev.musicEnabled };
      gsRef.current = next;
      if (next.musicEnabled && next.phase === "playing") startMusic();
      else stopMusic();
      return next;
    });
  }, []);

  const setDifficulty = useCallback((d: Difficulty) => {
    updateGs({ difficulty: d });
  }, [updateGs]);

  // ─── Controls (placed after pauseGame/resumeGame are declared) ───────────────

  // Stable refs so the one-time keydown listener always calls the latest version
  const pauseRef = useRef(pauseGame);
  const resumeRef = useRef(resumeGame);
  useEffect(() => { pauseRef.current = pauseGame; }, [pauseGame]);
  useEffect(() => { resumeRef.current = resumeGame; }, [resumeGame]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        const phase = gsRef.current.phase;
        if (phase === "playing") pauseRef.current();
        else if (phase === "paused") resumeRef.current();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseXRef.current = (e.clientX - rect.left) * (canvas.width / rect.width);
    };
    const onTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      touchXRef.current = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    };
    const onTouchEnd = () => { touchXRef.current = null; };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopMusic();
    };
  }, []);

  return {
    canvasRef,
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    goToMenu,
    toggleSound,
    toggleMusic,
    setDifficulty,
  };
}
