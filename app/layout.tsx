import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "App",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "App" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
