# Juggle — Neon Ball Arcade

A neon-styled ball juggling browser game built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Keep every ball bouncing — drop one and lose a life!

---

## Gameplay

Move the paddle to keep all balls from hitting the floor. The game gets progressively harder as new balls spawn with each scoring milestone.

**Controls**

| Action | Desktop | Mobile |
|---|---|---|
| Move paddle | Mouse pointer or `←` `→` / `A` `D` | Drag finger or on-screen buttons |
| Pause / Resume | `Esc` or `P` | Pause button (top-right HUD) |

**Scoring**

- +1 point per paddle hit
- Consecutive hits build a combo multiplier — every 3-hit streak adds a bonus point per hit
- Combo resets on any miss

---

## Features

- **3 difficulty levels** — Easy / Medium / Hard (gravity, ball count, lives, speed all scale)
- **Smooth physics** — gravity, wall bounce, ball-to-ball collision resolution, paddle angle influence
- **Particle effects** — burst on every paddle hit, neon glow on all elements
- **Motion trails** — each ball leaves a fading trail for a retro arcade feel
- **Procedural audio** — Web Audio API SFX + arpeggiated background music, no external files
- **Persistent high score** — saved in `localStorage`
- **Pause / resume** anytime
- **Animated overlays** — Framer Motion transitions between menu, pause, and game-over screens
- **Fully responsive** — works on desktop, tablet, and mobile with touch support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 — zero inline styles |
| Animation | Framer Motion |
| Rendering | HTML5 Canvas 2D (device-pixel-ratio aware) |
| Audio | Web Audio API (procedural, no assets) |
| State | React hooks + refs (game loop via `requestAnimationFrame`) |

---

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Tailwind import + neon utility classes
│   ├── icon.svg           # Auto-detected favicon (App Router)
│   ├── layout.tsx
│   └── page.tsx
├── types/
│   └── game.ts            # All game types + difficulty configs
├── utils/
│   ├── physics.ts         # Pure physics — ball/paddle/particle step functions
│   ├── renderer.ts        # Pure Canvas 2D drawing helpers
│   ├── sound.ts           # Web Audio procedural SFX + music
│   └── storage.ts         # localStorage helpers (SSR-safe)
├── hooks/
│   └── useGameEngine.ts   # rAF game loop, input handling, state management
└── components/
    ├── game/
    │   ├── GameCanvas.tsx  # Responsive canvas (ResizeObserver + DPR scaling)
    │   ├── Game.tsx        # Top-level: wires canvas + UI overlays
    │   └── GameLoader.tsx  # Client wrapper for dynamic(ssr:false)
    └── ui/
        ├── NeonButton.tsx
        ├── ScorePanel.tsx
        ├── MenuScreen.tsx
        ├── PauseScreen.tsx
        ├── GameOverScreen.tsx
        └── MobileControls.tsx
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Deploy to Vercel

Push to GitHub, then import the repo in [Vercel](https://vercel.com). No extra configuration required — the project is pre-configured for zero-config Vercel deployment.

---

## Difficulty Reference

| Setting | Easy | Medium | Hard |
|---|---|---|---|
| Gravity | 0.18 | 0.28 | 0.40 |
| Paddle speed | 14 | 12 | 10 |
| Starting balls | 1 | 2 | 3 |
| Max balls | 4 | 6 | 8 |
| Lives | 5 | 3 | 2 |
| Ball speed mult | ×0.7 | ×1.0 | ×1.4 |
| New ball every | 10 pts | 8 pts | 5 pts |
