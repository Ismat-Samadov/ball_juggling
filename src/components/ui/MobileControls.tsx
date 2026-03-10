/**
 * MobileControls — On-screen arrow buttons for mobile users.
 * Hidden on md+ via Tailwind (users use mouse or touch-drag instead).
 */
"use client";

import { useEffect, useRef } from "react";

interface Props {
  onLeft: (active: boolean) => void;
  onRight: (active: boolean) => void;
}

export function MobileControls({ onLeft, onRight }: Props) {
  const leftRef = useRef(false);
  const rightRef = useRef(false);

  // Emit synthetic key events so the game loop's key handler picks them up
  const pressLeft = (down: boolean) => {
    if (leftRef.current === down) return;
    leftRef.current = down;
    onLeft(down);
    window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key: "ArrowLeft", bubbles: true }));
  };

  const pressRight = (down: boolean) => {
    if (rightRef.current === down) return;
    rightRef.current = down;
    onRight(down);
    window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key: "ArrowRight", bubbles: true }));
  };

  // Ensure buttons release if finger lifts anywhere
  useEffect(() => {
    const up = () => { pressLeft(false); pressRight(false); };
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);
    return () => {
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const btnClass =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 border-purple-500/60 bg-purple-900/30 text-purple-300 text-2xl active:bg-purple-500/50 active:scale-95 transition-all select-none backdrop-blur-sm";

  return (
    <div className="md:hidden absolute bottom-4 inset-x-0 flex justify-between px-6 z-10 pointer-events-none">
      {/* Left */}
      <button
        className={`${btnClass} pointer-events-auto`}
        onTouchStart={() => pressLeft(true)}
        onTouchEnd={() => pressLeft(false)}
      >
        ◀
      </button>

      {/* Right */}
      <button
        className={`${btnClass} pointer-events-auto`}
        onTouchStart={() => pressRight(true)}
        onTouchEnd={() => pressRight(false)}
      >
        ▶
      </button>
    </div>
  );
}
