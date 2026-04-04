import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Toast from "@/components/Toast";
import BackgroundEffect from "@/components/BackgroundEffect";
import PWASetup from "@/components/PWASetup";

export const metadata: Metadata = {
  title: "VibeMatch — מצא את הספקים לאירוע שלך",
  description: "גלה ספקים לאירועים, נהל תקציב, לוח זמנים ואורחים — הכל במקום אחד.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibeMatch",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VibeMatch" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <AppProvider>
          <BackgroundEffect />
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
          <Toast />
          <PWASetup />
        </AppProvider>
      </body>
    </html>
  );
}
