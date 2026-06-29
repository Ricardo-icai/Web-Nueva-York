"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Language } from "@/lib/i18n";

export default function LanguageToggle() {
  const router = useRouter();
  const { dictionary, language, setLanguage } = useLanguage();

  function handleLanguageChange(nextLanguage: Language) {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-950/15 bg-white/80 p-1">
      {(["es", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleLanguageChange(value)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition ${
            language === value ? "bg-[#0A2342] text-white" : "text-slate-700"
          }`}
          aria-pressed={language === value}
          title={dictionary.common.language}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
