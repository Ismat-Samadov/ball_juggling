import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juggle — Neon Ball Arcade",
  description: "Keep the balls in the air! A neon-styled ball juggling browser game.",
  icons: { icon: "/icon.svg" },
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
