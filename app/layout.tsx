import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeMatch — מצא את שותף המוזיקה שלך",
  description: "התחבר עם אנשים שאוהבים את אותה מוזיקה. התאמה לפי ז'אנרים, ויבים ואמנים.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
