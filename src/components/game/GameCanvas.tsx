/**
 * GameCanvas — Responsive canvas that fills its parent.
 * Handles resize and forwards ref to the engine hook.
 */
"use client";

import { useEffect, useRef } from "react";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function GameCanvas({ canvasRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const { width, height } = container.getBoundingClientRect();
      // Use device pixel ratio for sharp rendering on retina
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [canvasRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
