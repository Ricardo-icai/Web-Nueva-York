"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    setEntered(false);
    const frame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(secondFrame);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={`route-transition-shell ${entered ? "route-transition-shell--entered" : ""}`}>
      {children}
    </div>
  );
}
