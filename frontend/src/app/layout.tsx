import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import AuthGate from "@/components/auth/AuthGate";
import AuthStatus from "@/components/auth/AuthStatus";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import BackButton from "@/components/navigation/BackButton";
import MenuDropdown from "@/components/navigation/MenuDropdown";
import NavigationFeedback from "@/components/navigation/NavigationFeedback";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";
import { getDictionary } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/server-language";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "NYC Family Planner",
  description: "Planificador inteligente de viaje para Nueva York",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getServerLanguage();
  const dictionary = getDictionary(language);

  return (
    <html lang={language} className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fff3d1] text-slate-900">
        <LanguageProvider initialLanguage={language}>
          <NavigationFeedback />
          <AuthGate>
            <header className="sticky top-0 z-[5000] px-3 py-3 sm:px-4">
              <nav className="nyc-glass-topbar mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <BackButton />
                  <Link href="/" className="font-american-diner text-sm tracking-[0.08em] text-slate-950 sm:text-base">
                    {dictionary.common.appName}
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <AuthStatus />
                  <MenuDropdown />
                </div>
              </nav>
            </header>
            <ProfileCompletionBanner />
            <main className="flex-1">{children}</main>
          </AuthGate>
        </LanguageProvider>
      </body>
    </html>
  );
}
