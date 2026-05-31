import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NYC Family Planner",
  description: "Planificador inteligente de viaje para Nueva York",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-sm font-bold tracking-wide text-sky-300">NYC FAMILY PLANNER</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/planner" className="hover:text-sky-300">Planes</Link>
              <Link href="/onboarding" className="rounded-full bg-sky-400 px-4 py-2 font-semibold text-slate-900 hover:bg-sky-300">Crear viaje</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
