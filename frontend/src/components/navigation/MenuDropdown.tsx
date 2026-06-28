"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function MenuDropdown() {
  const pathname = usePathname();
  const { dictionary } = useLanguage();
  const [open, setOpen] = useState(false);

  const menuLinks = useMemo(
    () => [
      { href: "/", label: dictionary.nav.home },
      { href: "/route-planner", label: dictionary.nav.planMyTrip },
      { href: "/restaurants", label: dictionary.nav.whereToEat },
      { href: "/nightlife", label: dictionary.nav.nightlife },
      { href: "/culture", label: dictionary.nav.culture },
      { href: "/viewpoints", label: dictionary.nav.rooftops },
      { href: "/fourth-of-july", label: dictionary.nav.fourthOfJuly },
      { href: "/esim-usa", label: dictionary.nav.esim },
      { href: "/onboarding", label: dictionary.nav.editProfile, profileAction: true },
    ],
    [dictionary],
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="nyc-action px-4 py-2 text-sm"
        aria-expanded={open}
        aria-controls="main-navigation-drawer"
      >
        {dictionary.nav.menu}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[5100] bg-slate-950/45 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />

          <div id="main-navigation-drawer" className="fixed inset-0 z-[5200] flex items-start justify-start p-1 sm:p-3" onClick={() => setOpen(false)}>
            <aside
              className="h-[calc(100dvh-0.5rem)] w-[min(86vw,360px)] overflow-hidden rounded-[28px] border border-slate-950/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,248,231,0.98))] shadow-[0_28px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:h-[calc(100dvh-1.5rem)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-stone-200 bg-[#0A2342] px-5 py-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">{dictionary.common.appName}</p>
                      <p className="mt-1 font-american-diner text-2xl">{dictionary.nav.menu}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-white text-xl font-black shadow-[3px_3px_0_rgba(255,255,255,0.55)] hover:bg-white/10"
                      aria-label={dictionary.nav.closeMenu}
                    >
                      x
                    </button>
                  </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                  {menuLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-base transition hover:-translate-y-0.5 ${
                        item.profileAction
                          ? "nyc-flag-action mt-5"
                          : "nyc-smooth-card border border-slate-950/80 bg-white/88 font-black text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.09)] hover:bg-[#fffdf4] hover:text-[#C1121F]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-stone-200 p-4 text-xs font-semibold leading-5 text-slate-500">
                  {dictionary.nav.drawerNote}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </>
  );
}
