import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeMatch — Find Your Musical Soulmate",
  description:
    "Connect with people who share your music taste. Match based on genres, vibes, and favorite artists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
