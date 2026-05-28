import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import SiteFooter from "@/components/SiteFooter";
import UpgradeBanner from "@/components/UpgradeBanner";
import ReturningVisitorBanner from "@/components/ReturningVisitorBanner";
import SaveProgressBanner from "@/components/SaveProgressBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrantWay – Find grants and benefits you qualify for",
  description:
    "GrantWay matches you to federal, state, and private funding programs based on your profile — for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* Upgrade success banner — shown on whichever page the user returns to after checkout */}
        <Suspense fallback={null}>
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
            <UpgradeBanner />
          </div>
        </Suspense>
        <Suspense fallback={null}>
          <ReturningVisitorBanner />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Suspense fallback={null}>
          <SaveProgressBanner />
        </Suspense>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
