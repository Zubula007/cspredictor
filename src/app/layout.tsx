import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { FixtureProvider } from "./context/FixtureContext";
import { LeaderboardProvider } from "./context/LeaderboardContext";

import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Championship Score Predictor",
  description: "CSPredictor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <FixtureProvider>
          <LeaderboardProvider>
            <div className="mx-auto max-w-7xl px-6 py-6">
              <Navbar />
              {children}
            </div>
          </LeaderboardProvider>
        </FixtureProvider>
      </body>
    </html>
  );
}