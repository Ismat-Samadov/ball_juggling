/**
 * GameLoader — Client component that lazily loads the game.
 * Must be a Client Component so dynamic({ ssr: false }) works.
 */
"use client";

import dynamic from "next/dynamic";

const Game = dynamic(
  () => import("./Game").then((m) => ({ default: m.Game })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a1a]">
        <div className="text-purple-400 text-xl tracking-widest animate-pulse">Loading...</div>
      </div>
    ),
  }
);

export function GameLoader() {
  return <Game />;
}
