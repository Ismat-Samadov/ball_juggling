/**
 * physics.ts
 * Pure physics helpers — no React / DOM dependencies.
 */

import type { Ball, Paddle, Particle, Vec2 } from "@/types/game";

// ─── Constants ────────────────────────────────────────────────────────────────

export const TRAIL_LENGTH = 8;
export const BALL_RADIUS = 18;
export const PADDLE_HEIGHT = 14;
export const WALL_BOUNCE_DAMPING = 0.85;
export const PADDLE_BOUNCE_MIN_VY = -14;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Angle between two vectors in radians */
export function angleBetween(a: Vec2, b: Vec2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

// ─── Ball factory ─────────────────────────────────────────────────────────────

let _ballId = 0;

export function createBall(
  canvasW: number,
  canvasH: number,
  speedMult: number
): Ball {
  return {
    id: _ballId++,
    pos: { x: randomRange(BALL_RADIUS * 2, canvasW - BALL_RADIUS * 2), y: canvasH * 0.3 },
    vel: {
      x: randomRange(-3, 3) * speedMult,
      y: randomRange(-6, -2) * speedMult,
    },
    radius: BALL_RADIUS,
    hue: Math.random() * 360,
    held: false,
    trail: [],
    wobble: Math.random() * Math.PI * 2,
  };
}

// ─── Particle factory ─────────────────────────────────────────────────────────

let _particleId = 0;

export function spawnParticles(pos: Vec2, hue: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(1, 6);
    return {
      id: _particleId++,
      pos: { ...pos },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      life: 1,
      maxLife: randomRange(0.4, 0.9),
      size: randomRange(3, 8),
      hue,
      alpha: 1,
    };
  });
}

// ─── Update functions ─────────────────────────────────────────────────────────

/**
 * Advance a single ball by one physics tick.
 * Returns true if the ball fell below the canvas (miss).
 */
export function stepBall(
  ball: Ball,
  gravity: number,
  canvasW: number,
  canvasH: number,
  paddle: Paddle,
  newParticles: Particle[],
  onHit: (ball: Ball) => void
): boolean {
  if (ball.held) return false;

  // Record trail
  ball.trail.push({ ...ball.pos });
  if (ball.trail.length > TRAIL_LENGTH) ball.trail.shift();

  // Advance wobble phase
  ball.wobble += 0.07;

  // Apply gravity
  ball.vel.y += gravity;

  // Move
  ball.pos.x += ball.vel.x;
  ball.pos.y += ball.vel.y;

  // Wall collisions (left / right)
  if (ball.pos.x - ball.radius < 0) {
    ball.pos.x = ball.radius;
    ball.vel.x = Math.abs(ball.vel.x) * WALL_BOUNCE_DAMPING;
  } else if (ball.pos.x + ball.radius > canvasW) {
    ball.pos.x = canvasW - ball.radius;
    ball.vel.x = -Math.abs(ball.vel.x) * WALL_BOUNCE_DAMPING;
  }

  // Ceiling
  if (ball.pos.y - ball.radius < 0) {
    ball.pos.y = ball.radius;
    ball.vel.y = Math.abs(ball.vel.y) * WALL_BOUNCE_DAMPING;
  }

  // Paddle collision
  const paddleTop = paddle.y;
  const paddleLeft = paddle.x - paddle.width / 2;
  const paddleRight = paddle.x + paddle.width / 2;

  const withinX = ball.pos.x + ball.radius > paddleLeft && ball.pos.x - ball.radius < paddleRight;
  const nearTop = ball.pos.y + ball.radius >= paddleTop && ball.pos.y < paddle.y + paddle.height;
  const movingDown = ball.vel.y > 0;

  if (withinX && nearTop && movingDown) {
    // Position correction
    ball.pos.y = paddleTop - ball.radius;

    // Reflect + add paddle lateral influence
    const relativeX = (ball.pos.x - paddle.x) / (paddle.width / 2); // -1 to 1
    ball.vel.y = Math.min(PADDLE_BOUNCE_MIN_VY, -Math.abs(ball.vel.y) * 1.05);
    ball.vel.x = relativeX * 6 + paddle.vx * 0.4;

    // Spawn hit particles
    const hits = spawnParticles({ x: ball.pos.x, y: ball.pos.y + ball.radius }, ball.hue, 10);
    newParticles.push(...hits);

    onHit(ball);
  }

  // Ball–ball collision
  // (handled externally after all balls are stepped)

  // Fell off bottom?
  return ball.pos.y - ball.radius > canvasH;
}

/** Resolve collisions between all pairs of balls. */
export function resolveBallCollisions(balls: Ball[]): void {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist && dist > 0) {
        // Normalise
        const nx = dx / dist;
        const ny = dy / dist;

        // Separate
        const overlap = (minDist - dist) / 2;
        a.pos.x -= nx * overlap;
        a.pos.y -= ny * overlap;
        b.pos.x += nx * overlap;
        b.pos.y += ny * overlap;

        // Exchange velocity components along collision normal
        const dvx = b.vel.x - a.vel.x;
        const dvy = b.vel.y - a.vel.y;
        const dot = dvx * nx + dvy * ny;
        if (dot < 0) {
          a.vel.x += dot * nx;
          a.vel.y += dot * ny;
          b.vel.x -= dot * nx;
          b.vel.y -= dot * ny;
        }
      }
    }
  }
}

/** Advance all particles one tick; removes dead ones. */
export function stepParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      pos: { x: p.pos.x + p.vel.x, y: p.pos.y + p.vel.y },
      vel: { x: p.vel.x * 0.92, y: p.vel.y * 0.92 + 0.15 },
      life: p.life - 0.025 / p.maxLife,
      alpha: Math.max(0, p.life),
    }))
    .filter((p) => p.life > 0);
}
