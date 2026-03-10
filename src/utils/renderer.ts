/**
 * renderer.ts
 * All Canvas 2D drawing helpers — pure functions, no React.
 */

import type { Ball, Paddle, Particle } from "@/types/game";

// ─── Background ───────────────────────────────────────────────────────────────

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Deep space gradient
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
  grad.addColorStop(0, "#0d0b2b");
  grad.addColorStop(1, "#050412");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Grid lines for retro-neon floor feel
  ctx.strokeStyle = "rgba(100, 60, 220, 0.08)";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

// ─── Paddle ───────────────────────────────────────────────────────────────────

export function drawPaddle(ctx: CanvasRenderingContext2D, paddle: Paddle): void {
  const { x, y, width, height } = paddle;
  const left = x - width / 2;
  const radius = height / 2;

  ctx.save();

  // Outer glow
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 20;

  // Rounded rect body
  const grad = ctx.createLinearGradient(left, y, left + width, y + height);
  grad.addColorStop(0, "#c084fc");
  grad.addColorStop(0.5, "#a855f7");
  grad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.roundRect(left, y, width, height, radius);
  ctx.fill();

  // Top highlight
  ctx.shadowBlur = 0;
  const highlight = ctx.createLinearGradient(left, y, left, y + height * 0.5);
  highlight.addColorStop(0, "rgba(255,255,255,0.35)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.roundRect(left + 2, y + 2, width - 4, height * 0.5, radius - 2);
  ctx.fill();

  ctx.restore();
}

// ─── Ball ─────────────────────────────────────────────────────────────────────

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
  const { pos, radius, hue, trail, wobble } = ball;

  // Draw trail
  trail.forEach((tp, i) => {
    const alpha = (i / trail.length) * 0.35;
    const r = radius * (i / trail.length) * 0.7;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Subtle wobble scale
  const scaleX = 1 + Math.sin(wobble) * 0.04;
  const scaleY = 1 - Math.sin(wobble) * 0.04;

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.scale(scaleX, scaleY);

  // Glow
  ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
  ctx.shadowBlur = 28;

  // Outer sphere
  const sphereGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.05, 0, 0, radius);
  sphereGrad.addColorStop(0, `hsl(${hue}, 90%, 88%)`);
  sphereGrad.addColorStop(0.4, `hsl(${hue}, 90%, 60%)`);
  sphereGrad.addColorStop(1, `hsl(${(hue + 40) % 360}, 90%, 30%)`);
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.shadowBlur = 0;
  const spec = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, 1, -radius * 0.35, -radius * 0.35, radius * 0.55);
  spec.addColorStop(0, "rgba(255,255,255,0.65)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Particles ────────────────────────────────────────────────────────────────

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha * p.life;
    ctx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
    ctx.shadowBlur = 12;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 75%)`;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ─── Combo text ───────────────────────────────────────────────────────────────

export interface ComboPopup {
  text: string;
  x: number;
  y: number;
  life: number; // 0–1
  hue: number;
}

export function drawComboPopups(ctx: CanvasRenderingContext2D, popups: ComboPopup[]): ComboPopup[] {
  return popups
    .map((p) => {
      const alpha = p.life;
      const size = 20 + (1 - p.life) * 10;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
      ctx.shadowBlur = 15;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 75%)`;
      ctx.font = `bold ${size}px 'Arial', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
      return { ...p, y: p.y - 0.8, life: p.life - 0.018 };
    })
    .filter((p) => p.life > 0);
}

// ─── Lives indicator ──────────────────────────────────────────────────────────

export function drawLives(ctx: CanvasRenderingContext2D, lives: number, maxLives: number, w: number): void {
  const dotR = 7;
  const gap = 20;
  const startX = w / 2 - ((maxLives - 1) * gap) / 2;
  for (let i = 0; i < maxLives; i++) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(startX + i * gap, 20, dotR, 0, Math.PI * 2);
    if (i < lives) {
      ctx.shadowColor = "#f0abfc";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#e879f9";
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
    }
    ctx.fill();
    ctx.restore();
  }
}
