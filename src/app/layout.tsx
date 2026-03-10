import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ball Juggling — Neon Arcade",
  description: "Keep the balls in the air! A neon-styled ball juggling browser game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a1a] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
