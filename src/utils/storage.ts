/**
 * storage.ts
 * localStorage helpers — safely handles SSR (no window).
 */

import type { Difficulty } from "@/types/game";

const KEY_HIGH_SCORE = "juggle_highScore";
const KEY_DIFFICULTY = "juggle_difficulty";
const KEY_SOUND = "juggle_sound";
const KEY_MUSIC = "juggle_music";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function getHighScore(): number {
  return safe(() => parseInt(localStorage.getItem(KEY_HIGH_SCORE) ?? "0", 10), 0);
}

export function saveHighScore(score: number): void {
  safe(() => localStorage.setItem(KEY_HIGH_SCORE, String(score)), undefined);
}

export function getDifficulty(): Difficulty {
  return safe(() => (localStorage.getItem(KEY_DIFFICULTY) as Difficulty) ?? "medium", "medium");
}

export function saveDifficulty(d: Difficulty): void {
  safe(() => localStorage.setItem(KEY_DIFFICULTY, d), undefined);
}

export function getSoundEnabled(): boolean {
  return safe(() => (localStorage.getItem(KEY_SOUND) ?? "true") === "true", true);
}

export function saveSoundEnabled(v: boolean): void {
  safe(() => localStorage.setItem(KEY_SOUND, String(v)), undefined);
}

export function getMusicEnabled(): boolean {
  return safe(() => (localStorage.getItem(KEY_MUSIC) ?? "true") === "true", true);
}

export function saveMusicEnabled(v: boolean): void {
  safe(() => localStorage.setItem(KEY_MUSIC, String(v)), undefined);
}
