import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Housing Portal",
  description: "Unified portal for housing price estimation and market analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_24%),linear-gradient(180deg,_#f8fafc,_#eef6ff_45%,_#f8fafc)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),transparent)]" />
          {children}
        </main>
      </body>
    </html>
  );
}
