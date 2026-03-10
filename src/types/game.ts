// ─── Core game entity types ───────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  /** Hue in degrees (0-360) for neon colour */
  hue: number;
  /** True while the ball is being dragged / just tapped */
  held: boolean;
  /** Trail history for motion blur effect */
  trail: Vec2[];
  /** Wobble phase for subtle visual animation */
  wobble: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Current lateral velocity — used for hit direction calculation */
  vx: number;
}

export interface Particle {
  id: number;
  pos: Vec2;
  vel: Vec2;
  life: number;        // 0–1, decreases each frame
  maxLife: number;
  size: number;
  hue: number;
  alpha: number;
}

// ─── Game state ───────────────────────────────────────────────────────────────

export type GamePhase = "menu" | "playing" | "paused" | "gameover";

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  /** Number of balls currently in play */
  ballCount: number;
  /** Misses remaining before game over */
  lives: number;
  /** Current round / wave */
  round: number;
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

// ─── Difficulty config ────────────────────────────────────────────────────────

export interface DifficultyConfig {
  label: string;
  gravity: number;
  paddleSpeed: number;
  initialBalls: number;
  /** After how many points a new ball spawns */
  newBallEvery: number;
  /** Max balls on screen */
  maxBalls: number;
  lives: number;
  /** Ball speed multiplier */
  speedMult: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    gravity: 0.18,
    paddleSpeed: 14,
    initialBalls: 1,
    newBallEvery: 10,
    maxBalls: 4,
    lives: 5,
    speedMult: 0.7,
  },
  medium: {
    label: "Medium",
    gravity: 0.28,
    paddleSpeed: 12,
    initialBalls: 2,
    newBallEvery: 8,
    maxBalls: 6,
    lives: 3,
    speedMult: 1.0,
  },
  hard: {
    label: "Hard",
    gravity: 0.4,
    paddleSpeed: 10,
    initialBalls: 3,
    newBallEvery: 5,
    maxBalls: 8,
    lives: 2,
    speedMult: 1.4,
  },
};
