"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isLocalNavigation(target: HTMLAnchorElement) {
  if (target.target && target.target !== "_self") return false;
  if (target.hasAttribute("download")) return false;

  const url = new URL(target.href, window.location.href);
  if (url.origin !== window.location.origin) return false;

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `${url.pathname}${url.search}${url.hash}` !== current;
}

export default function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const finish = window.setTimeout(() => setPending(false), 120);
    return () => window.clearTimeout(finish);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !isLocalNavigation(anchor)) return;

      setPending(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setPending(false), 1800);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-slate-950/10">
      <div className="h-full w-2/3 animate-[nav-progress_0.9s_ease-in-out_infinite] bg-red-700 shadow-[0_0_18px_rgba(193,18,31,0.45)]" />
    </div>
  );
}
