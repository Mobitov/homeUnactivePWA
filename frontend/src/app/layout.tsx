import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNavigation } from "../components/navigation/BottomNavigation";
import { TopNavigation } from "../components/navigation/TopNavigation";
import { InstallPWA } from "../components/InstallPWA";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeUnactive",
  description: "Track and analyze your sports training sessions",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HomeUnactive",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4299e1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.className}>
      <body className="min-h-screen text-primary transition-colors duration-200" style={{ background: 'var(--background)' }}>
        <Providers>
          <InstallPWA />
          <TopNavigation />
          <main className="pb-16 pt-20 px-4 max-w-5xl mx-auto">
            {children}
          </main>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}